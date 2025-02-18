'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '../../context';
import {
  MainControls,
  Modal,
  ModalConfirm,
  ModalUpdateItem,
  FormErrorMessage,
  Toast,
} from '../../components';
import {
  useInnerWidth,
  useListItemsMobileReset,
  useCloseListItemsYAxis,
} from '../../hooks';
import { createItem, getItem, deleteItem } from '../../actions';
import { itemSchema } from '../../schemas/schemas';
import { handleModalResetPageScrolling } from '../../utilities';
import {
  MOBILE_BREAKPOINT,
  MODAL_CONFIRM_DELETION_HEADLINE,
  MODAL_UPDATE_ITEM_HEADLINE,
  MODAL_CONFIRM_DELETE_BUTTON,
} from '../../constants';

const ItemsColumn = dynamic(() =>
  import('../../components/dashboard/ItemsColumn')
);
const Reminders = dynamic(() => import('../../components/dashboard/Reminders'));

const Dashboard = ({ tasks, categories, reminders, user }) => {
  const { userId, timezone, admin } = user;

  const { setUserId, setShowToast, setShowModal, setIsAdmin } = useAppContext();

  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();
  const handleCloseListItemsYAxis = useCloseListItemsYAxis();

  const [totalNumberOfItems, setTotalNumberOfItems] = useState(0);
  const [listItems, setListItems] = useState(tasks);
  const [listItem, setListItem] = useState({
    _id: '',
    userId,
    categoryId: '',
    title: '',
    column: 1,
    priority: 1,
    type: '',
    description: '',
    date: '',
    dateAndTime: '',
    mandatoryDate: false,
    confirmDeletion: false,
    itemLimit: 0,
  });
  const [masonryItems, setMasonryItems] = useState([]);
  const [priority, setPriority] = useState(0);
  const [taskToEditId, setTaskToEditId] = useState('');
  const [isAwaitingAddResponse, setIsAwaitingAddResponse] = useState(false);
  const [isAwaitingEditResponse, setIsAwaitingEditResponse] = useState(false);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [errorMessages, setErrorMessages] = useState('');

  let allItems = [];

  // set priority of next new item
  useEffect(() => {
    if (!listItem?.type) return;

    const selectedCategoryData = listItems.find(
      (category) => Object.keys(category)[0] === listItem?.type
    );

    if (typeof selectedCategoryData === 'undefined') {
      setPriority(1);
      return;
    }

    const priorityOfNewItem = Object.values(selectedCategoryData)[0].length + 1;

    setPriority(priorityOfNewItem);
  }, [listItem]);

  // ensure list item always has correct priorty of next new item
  useEffect(() => {
    setListItem({
      ...listItem,
      priority,
    });
  }, [priority]);

  useEffect(() => {
    // set global context user id and timezone
    setUserId(userId);
    setIsAdmin(admin);
    setListItem({
      ...listItem,
      type: categories?.length ? categories[0]['title'] : '',
      categoryId: categories?.length ? categories[0]['_id'] : '',
    });
  }, []);

  // build masonry
  useEffect(() => {
    if (!width) return;
    const itemsCopy = [...listItems];
    const items = itemsCopy.filter((item) => Object.values(item)[0]?.length);
    let total = 0;

    const handleMasonry = (columns, items) => {
      const masonryColumns = [];
      // create columns array
      for (let i = 0; i < columns; i++) {
        masonryColumns.push({ [`column_${i}`]: [] });
      }

      // add items to columns array
      for (let i = 0; i < items?.length; i++) {
        const column = i % columns;
        masonryColumns[column][`column_${column}`].push(items[i]);
        total += Object.values(items[i])[0]?.length;
      }

      setMasonryItems(masonryColumns);
      // total number of items for limit handling
      setTotalNumberOfItems(total);
      setListItem({
        ...listItem,
        itemLimit: total,
      });
    };

    const numberOfColumns =
      width >= 1400 && items?.length >= 4
        ? 4
        : (width < 1400 && width >= 1080 && items?.length >= 3) ||
          (items?.length === 3 && width >= 1080)
        ? 3
        : (width < 1080 && width >= 704 && items?.length >= 2) ||
          (items?.length === 2 && width >= 704)
        ? 2
        : width < 704 || items?.length === 1
        ? 1
        : undefined;

    handleMasonry(numberOfColumns, items);
  }, [listItems, width]);

  // remove at-item-limit message after item deletion
  useEffect(() => {
    if (errorMessages?.atItemLimit && totalNumberOfItems < LIST_ITEM_LIMIT) {
      setErrorMessages({ ...errorMessages, atItemLimit: false });
    }
  }, [totalNumberOfItems]);

  // set item title and priority
  const handleSetListItem = (e) => {
    setListItem({
      ...listItem,
      title: e.target.value,
    });

    if (errorMessages) {
      setErrorMessages('');
    }
  };

  // create new item
  const handleOnSubmit = (e) => {
    e.preventDefault();

    const zodValidationResults = itemSchema.safeParse({
      ...listItem,
      isDetailsForm: false,
    });
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { title, itemLimit } = error.flatten().fieldErrors;

      if (!title && !itemLimit) {
        const serverError = {
          status: 400,
          error: 'Invalid FormData. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessages(title?.[0] ? title?.[0] : itemLimit?.[0]);
      return;
    }

    setIsAwaitingAddResponse(true);
    createItem(zodFormData, false).then((res) => {
      if (res.status === 200) {
        setListItems(
          listItems.map((item) => {
            if (Object.keys(item)[0] === res.item.type) {
              return {
                [Object.keys(item)[0]]: [...Object.values(item)[0], res.item],
              };
            } else {
              return item;
            }
          })
        );

        if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
        setListItem({ ...listItem, title: '' });
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setIsAwaitingAddResponse(false);
    });
  };

  // open modal for update
  const getItemToUpdate = (id) => {
    setIsAwaitingEditResponse(true);
    setTaskToEditId(id);
    getItem(id, userId).then((res) => {
      if (res.status === 200) {
        setShowModal(
          <Modal showCloseButton={false}>
            <h2>{MODAL_UPDATE_ITEM_HEADLINE}</h2>
            <ModalUpdateItem
              itemToUpdate={res.item}
              items={listItems}
              setItems={setListItems}
              totalNumberOfItems={totalNumberOfItems}
            />
          </Modal>
        );
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setIsAwaitingEditResponse(false);
    });
  };

  // delete item
  const handleDeleteTask = (id, confirmDeletion = false) => {
    if (confirmDeletion) {
      setShowModal(
        <Modal showCloseButton={false}>
          <h2>{MODAL_CONFIRM_DELETION_HEADLINE}</h2>
          <ModalConfirm
            handleConfirm={handleDeleteTask}
            confirmId={id}
            confirmBtnText={MODAL_CONFIRM_DELETE_BUTTON}
          />
        </Modal>
      );
      return;
    }

    setIsAwaitingDeleteResponse(true);
    deleteItem(id, userId).then((res) => {
      if (res.status === 200) {
        setListItems(
          listItems.map((item) => {
            if (Object.keys(item)[0] === res.item.type) {
              return {
                [Object.keys(item)[0]]: Object.values(item)[0].filter(
                  (item) => item._id !== res.item._id
                ),
              };
            } else {
              return item;
            }
          })
        );

        if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setShowModal(null);
      handleModalResetPageScrolling();
      setIsAwaitingDeleteResponse(false);
      handleCloseListItemsYAxis();
    });
  };

  return (
    <div className='content-container'>
      {errorMessages && (
        <FormErrorMessage
          errorMessage={errorMessages}
          className='form-error-message form-error-message--position-static'
        />
      )}
      <MainControls
        categories={categories}
        handleOnSubmit={handleOnSubmit}
        title={listItem?.title}
        handleSetListItem={handleSetListItem}
        setListItem={setListItem}
        type={listItem?.type}
        column={listItem?.column}
        categoryId={listItem?.categoryId}
        isAwaitingAddResponse={isAwaitingAddResponse}
        priority={priority}
      />
      {reminders && reminders?.length > 0 && (
        <Reminders reminders={reminders} />
      )}
      <div className='items-column-wrapper'>
        {masonryItems.map((columnData, index) => (
          <div
            className='items-masonry-column'
            key={`items-masonry-column_${index}`}
          >
            {Object.values(columnData)[0].map((item, index) => (
              <ItemsColumn
                key={`items-column_${index}`}
                heading={Object.keys(item)[0]}
                items={Object.values(item)[0]}
                setListItems={setListItems}
                getItemToUpdate={getItemToUpdate}
                handleDeleteItem={handleDeleteTask}
                itemToUpdateId={taskToEditId}
                isAwaitingEditResponse={isAwaitingEditResponse}
                isAwaitingDeleteResponse={isAwaitingDeleteResponse}
                allItems={allItems}
                timezone={timezone}
                totalNumberOfItems={totalNumberOfItems}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
