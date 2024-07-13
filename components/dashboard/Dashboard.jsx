'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '../../context';
import {
  MainControls,
  Modal,
  ModalDelete,
  ModalUpdateItem,
  FormErrorMessage,
  Toast,
} from '../../components';
import { useInnerWidth } from '../../hooks';
import { createItem, getItem, deleteItem } from '../../actions';
import {
  MOBILE_BREAKPOINT,
  MODAL_CONFIRM_DELETION_HEADLINE,
  MODAL_UPDATE_ITEM_HEADLINE,
  ITEM_ERROR_MESSAGES,
} from '../../constants';

const ItemsColumn = dynamic(() =>
  import('../../components/dashboard/ItemsColumn')
);
const Reminders = dynamic(() => import('../../components/dashboard/Reminders'));

const Dashboard = ({ tasks, categories, reminders, userId }) => {
  const width = useInnerWidth();

  const { setUserId, setShowToast, setShowModal } = useAppContext();

  const [listItems, setListItems] = useState(tasks);
  const [listItem, setListItem] = useState({
    userId,
    title: '',
    column: 1,
    priority: 1,
    type: '',
    description: '',
    date: '',
    dateAndTime: '',
    mandatoryDate: false,
  });
  const [masonryItems, setMasonryItems] = useState([]);
  const [priority, setPriority] = useState(0);
  const [taskToEditId, setTaskToEditId] = useState('');
  const [isAwaitingAddResponse, setIsAwaitingAddResponse] = useState(false);
  const [isAwaitingEditResponse, setIsAwaitingEditResponse] = useState(false);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [allItemsTouchReset, setAllItemsTouchReset] = useState(false);
  const [errorMessages, setErrorMessages] = useState(ITEM_ERROR_MESSAGES);

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
    // set global context user id
    setUserId(userId);

    setListItem({
      ...listItem,
      type: categories?.length ? categories[0]['type'] : '',
    });
  }, []);

  // build masonry
  useEffect(() => {
    if (!window || !width) return;

    const generateMasonry = (columns, listItems) => {
      const masonryColumns = [];
      const itemsCopy = [...listItems];
      const items = itemsCopy.filter((item) => Object.values(item)[0]?.length);

      // create columns array
      for (let i = 0; i < columns; i++) {
        masonryColumns.push({ [`column_${i}`]: [] });
      }

      // add items to columns array
      for (let i = 0; i < items?.length; i++) {
        const column = i % columns;
        masonryColumns[column][`column_${column}`].push(items[i]);
      }

      setMasonryItems(masonryColumns);
    };

    const numberOfColumns =
      width > 1400
        ? 4
        : width < 1400 && width > 1080
        ? 3
        : width < 1080 && width > 704
        ? 2
        : 1;

    generateMasonry(numberOfColumns, listItems);
  }, [listItems, width]);

  // remove at-item-limit message after item deletion
  useEffect(() => {
    if (errorMessages?.atItemLimit && listItems?.length < 50) {
      setErrorMessages({ ...errorMessages, atItemLimit: false });
    }
  }, [listItems]);

  // ensure all items are closed on mobile after new item is created or item is deleted
  const handleItemsTouchReset = () => {
    allItems = Array.from(document.querySelectorAll('.list-item__item'));
    allItems.forEach((item) => {
      item.style.transition = 'unset';
      item.style.transform = 'translateX(0)';
    });
    setAllItemsTouchReset(true);
  };

  // set item title and priority
  const handleSetListItem = (e) => {
    setListItem({
      ...listItem,
      title: e.target.value,
    });

    if (errorMessages?.isEmpty) {
      setErrorMessages({ ...errorMessages, isEmpty: false });
    }
  };

  // create new item
  const handleOnSubmit = (formData) => {
    // handle empty field message
    if (!listItem?.title) {
      setErrorMessages({ ...errorMessages, isEmpty: true });
      return;
    }

    // handle at-item-limit message
    if (listItems?.length >= 50) {
      setErrorMessages({ ...errorMessages, atItemLimit: true });
      return;
    }

    setIsAwaitingAddResponse(true);
    createItem(formData).then((res) => {
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
        if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();
        setListItem({ ...listItem, title: '' });
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setIsAwaitingAddResponse(false);
    });
  };

  // get item to edit
  const handleEditTask = (id) => {
    setIsAwaitingEditResponse(true);
    setTaskToEditId(id);
    getItem(id).then((res) => {
      if (res.status === 200) {
        setShowModal(
          <Modal>
            <h2>{MODAL_UPDATE_ITEM_HEADLINE}</h2>
            <ModalUpdateItem
              userId={userId}
              itemToUpdate={res.item}
              itemToEditId={id}
              items={listItems}
              setItems={setListItems}
              setTaskToEditId={setTaskToEditId}
              handleCloseMobileItem={handleItemsTouchReset}
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
        <Modal>
          <h2>{MODAL_CONFIRM_DELETION_HEADLINE}</h2>
          <ModalDelete
            handleDeleteItem={handleDeleteTask}
            modalIdToDelete={id}
          />
        </Modal>
      );
      return;
    }

    setIsAwaitingDeleteResponse(true);
    deleteItem(id).then((res) => {
      if (res.status === 200) {
        setListItems(
          listItems.map((item) => {
            if (Object.keys(item)[0] === res.item.type) {
              return {
                [Object.keys(item)[0]]: Object.values(item)[0].filter(
                  (item) => item._id !== id
                ),
              };
            } else {
              return item;
            }
          })
        );

        if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setShowModal(null);
      setIsAwaitingDeleteResponse(false);
    });
  };

  // close currently open item when a new item is opened
  const closeOpenItem = (currentItemId) => {
    allItems = Array.from(document.querySelectorAll('.list-item__item'));
    allItems.forEach((item) => {
      if (item?.id !== currentItemId) {
        item.style.transition = 'transform 150ms';
        item.style.transform = 'translateX(0)';
      }
    });
    return currentItemId;
  };

  return (
    <div className='content-container'>
      {(errorMessages?.isEmpty || errorMessages?.atItemLimit) && (
        <FormErrorMessage
          errorMessage={
            errorMessages?.isEmpty
              ? errorMessages?.isEmptyMessage
              : errorMessages?.atItemLimitMessage
          }
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
        isAwaitingAddResponse={isAwaitingAddResponse}
        priority={priority}
        userId={userId}
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
                handleEditTask={handleEditTask}
                handleDeleteTask={handleDeleteTask}
                taskToEditId={taskToEditId}
                isAwaitingEditResponse={isAwaitingEditResponse}
                isAwaitingDeleteResponse={isAwaitingDeleteResponse}
                closeOpenItem={closeOpenItem}
                allItems={allItems}
                setAllItemsTouchReset={setAllItemsTouchReset}
                allItemsTouchReset={allItemsTouchReset}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
