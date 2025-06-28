'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '../../context';
import {
  Week,
  Modal,
  ModalConfirm,
  ModalCreateItem,
  ModalUpdateItem,
  ModalSubscribe,
  FormErrorMessage,
  Toast,
} from '../../components';
import {
  useInnerWidth,
  useListItemsMobileReset,
  useCloseListItemsYAxis,
} from '../../hooks';
import { getItem, deleteItem } from '../../actions';
import { handleModalResetPageScrolling } from '../../utilities';
import {
  MOBILE_BREAKPOINT,
  MODAL_CONFIRM_DELETION_HEADLINE,
  MODAL_UPDATE_ITEM_HEADLINE,
  MODAL_CONFIRM_DELETE_BUTTON,
  LIST_ITEM_LIMIT,
  UNSUBSCRIBED_LIST_ITEM_LIMIT,
} from '../../constants';

const Reminders = dynamic(() => import('../../components/dashboard/Reminders'));
const ItemsColumn = dynamic(() =>
  import('../../components/dashboard/ItemsColumn')
);

const Dashboard = ({ tasks, calendar, categories, reminders, user }) => {
  const { userId, timezone, admin, isSubscribed, customerId, email } = user;

  const {
    setUserId,
    setShowToast,
    setShowModal,
    setIsAdmin,
    calendarItems,
    setCalendarItems,
  } = useAppContext();

  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();
  const handleCloseListItemsYAxis = useCloseListItemsYAxis();

  const [totalNumberOfItems, setTotalNumberOfItems] = useState(0);
  const [listItems, setListItems] = useState(tasks);
  const [masonryItems, setMasonryItems] = useState([]);
  const [taskToEditId, setTaskToEditId] = useState('');
  const [isAwaitingEditResponse, setIsAwaitingEditResponse] = useState(false);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [atItemsLimit, setAtItemsLimit] = useState(false);

  const listItemLimit = isSubscribed
    ? LIST_ITEM_LIMIT
    : UNSUBSCRIBED_LIST_ITEM_LIMIT;
  const userNoLongerSubscribed = !isSubscribed && customerId;
  let allItems = [];

  useEffect(() => {
    // set global context
    setUserId(userId);
    setIsAdmin(admin);
    setCalendarItems(calendar);
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
    if (atItemsLimit && totalNumberOfItems < listItemLimit) {
      setAtItemsLimit(false);
    }
  }, [totalNumberOfItems]);

  // open modal for create
  const handleOpenCreateItemModal = () => {
    if (totalNumberOfItems >= listItemLimit) {
      setAtItemsLimit(true);
      setShowModal(
        <Modal className='modal modal__form-modal--small'>
          <h2>Subscribe for Just $1 a Month</h2>
          <ModalSubscribe
            userNoLongerSubscribed={userNoLongerSubscribed}
            userId={userId}
            email={email}
          />
        </Modal>
      );
      return;
    }

    setShowModal(
      <Modal className='modal modal__form-modal--small'>
        <h2>Create Item</h2>
        <ModalCreateItem
          userId={userId}
          categories={categories}
          items={listItems}
          setItems={setListItems}
          totalNumberOfItems={totalNumberOfItems}
        />
      </Modal>
    );
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

        if (calendarItems && calendarItems?.length > 0) {
          setCalendarItems(
            calendarItems?.map((item) => {
              return {
                [Object.keys(item)[0]]: Object.values(item)[0].filter(
                  (item) => item?._id !== res.item._id
                ),
              };
            })
          );
        }

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
      {atItemsLimit && (
        <FormErrorMessage
          errorMessage={`Limit ${listItemLimit} Items!`}
          className='form-error-message form-error-message--position-static'
        />
      )}
      <div className='dashboard-button-wrapper'>
        <button
          onClick={handleOpenCreateItemModal}
          type='button'
          className='entry-form__button'
        >
          Create Item
        </button>
      </div>
      <Week timezone={timezone} userId={userId} />
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
