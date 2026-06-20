'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context';
import {
  Week,
  ItemsColumn,
  CTA,
  Modal,
  ModalCreateItem,
  ModalUpdateItem,
  ModalConfirm,
  ModalSubscribe,
  FormErrorMessage,
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
  LIST_ITEM_LIMIT,
  UNSUBSCRIBED_LIST_ITEM_LIMIT,
} from '../../constants';

const Reminders = dynamic(() => import('../../components/dashboard/Reminders'));
const Toast = dynamic(() => import('../../components/shared/Toast'), {
  ssr: false,
});

const Dashboard = ({ tasks, calendar, categories, reminders, user }) => {
  const { userId, timezone, isSubscribed } = user;

  const router = useRouter();

  const { setShowToast, setShowModal } = useAppContext();

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

  let allItems = [];

  // build masonry
  useEffect(() => {
    if (!width) return;
    const items = listItems?.filter((item) => Object.values(item)[0]?.length);
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAtItemsLimit(false);
    }
  }, [totalNumberOfItems]);

  // open modal for create
  const handleOpenCreateItemModal = () => {
    if (totalNumberOfItems >= listItemLimit) {
      setAtItemsLimit(true);
      setShowModal(
        <Modal className='modal modal__form-modal--small modal__subscription-modal'>
          <ModalSubscribe userId={userId} />
        </Modal>,
      );
      return;
    }

    setShowModal(
      <Modal className='modal modal__form-modal--small'>
        <ModalCreateItem
          userId={userId}
          categories={categories}
          items={listItems}
          setItems={setListItems}
          totalNumberOfItems={totalNumberOfItems}
        />
      </Modal>,
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
            <ModalUpdateItem
              itemToUpdate={res.item}
              items={listItems}
              setItems={setListItems}
              totalNumberOfItems={totalNumberOfItems}
            />
          </Modal>,
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
          <ModalConfirm
            handleConfirm={handleDeleteTask}
            confirmId={id}
            confirmType='Delete'
            className='cta-button--red'
          />
        </Modal>,
      );
      return;
    }

    setIsAwaitingDeleteResponse(true);

    // Check whether item is in calendar and revalidate path on server if so
    const checkForCalendarItem = (id) => {
      if (calendar && calendar?.length > 0) {
        for (const item of calendar) {
          if (Object.values(item)[0].find((item) => item._id === id))
            return true;
        }
      }

      return false;
    };

    deleteItem(id, checkForCalendarItem(id), userId).then((res) => {
      if (res.status === 200) {
        setListItems(
          listItems.map((item) => {
            if (Object.keys(item)[0] === res.item.type) {
              return {
                [Object.keys(item)[0]]: Object.values(item)[0].filter(
                  (item) => item._id !== res.item._id,
                ),
              };
            } else {
              return item;
            }
          }),
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
      {atItemsLimit && (
        <FormErrorMessage
          errorMessage={`Limit ${listItemLimit} Items!`}
          className='form-error-message form-error-message--position-static'
        />
      )}
      <CTA
        text='Create Item'
        className='cta-button cta-button--medium cta-button--purple'
        ariaLabel='Create dashboard item'
        handleClick={handleOpenCreateItemModal}
      />
      <Week timezone={timezone} userId={userId} calendar={calendar} />
      {reminders && reminders?.length > 0 && (
        <Reminders reminders={reminders} userId={userId} />
      )}
      <div className='items-column-wrapper'>
        {masonryItems &&
          masonryItems?.length > 0 &&
          masonryItems.map((columnData, index) => (
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
