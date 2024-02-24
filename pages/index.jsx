import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import connectDB from '../config/db';
import { useAppContext } from 'context';
import { getCookie } from 'cookies-next';
import { jwtVerify } from 'jose';
import Task from '../models/Task';
import Category from '../models/Category';
import Reminder from '../models/Reminder';
import {
  MainControls,
  ItemsColumn,
  BirthdaysColumn,
  Modal,
} from '../components';
import { useInnerWidth } from '../hooks';
import { useUpcomingBirthdays } from '../hooks';
import { submitTask, getTask, updateTask, deleteTask } from '../services';
import { handleSortItemsAscending } from 'utilities';
import {
  MOBILE_BREAKPOINT,
  MODAL_CONFIRM_DELETION_HEADLINE,
} from '../constants';

const Reminders = dynamic(() => import('../components/Reminders'));

const Home = ({ tasks, categories, reminders, userId }) => {
  const width = useInnerWidth();
  const birthhdays = useUpcomingBirthdays();

  const { setUserId, setShowToast, setServerError, setShowModal } =
    useAppContext();

  const [listItems, setListItems] = useState(tasks);
  const [sortedListItems, setSortedListItems] = useState([]);
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
  const [priority, setPriority] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskToEditId, setTaskToEditId] = useState('');
  const [isAwaitingAddResponse, setIsAwaitingAddResponse] = useState(false);
  const [isAwaitingUpdateResponse, setIsAwaitingUpdateResponse] =
    useState(false);
  const [isAwaitingEditResponse, setIsAwaitingEditResponse] = useState(false);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [allItemsTouchReset, setAllItemsTouchReset] = useState(false);

  const allItems = [];

  // dynamic column data sorting
  useEffect(() => {
    if (!listItems.length) {
      setSortedListItems([]);
      return;
    }

    // remove duplicates and return type and column order
    const columnTypes = [
      ...listItems.reduce(
        (map, item) => map.set(item?.column, item?.type),
        new Map()
      ),
    ];

    // sort column order ascending
    const sortedColumnTypes = columnTypes.sort((a, b) => a[0] - b[0]);

    // create data structure
    const columnsData = [];
    for (const item of sortedColumnTypes) {
      const obj = {};
      obj[item[1]] = [];
      columnsData.push(obj);
    }

    // add items to array
    for (const item of listItems) {
      for (const column of columnsData) {
        if (Object.keys(column)[0] === item?.type) {
          Object.values(column)[0].push(item);
        }
      }
    }

    // sort arrays by date asc when date is present
    for (const item of columnsData) {
      if (Object.values(item)[0][0]['date'] !== null) {
        const itemsWithDatesSortedAsc = handleSortItemsAscending(
          Object.values(item)[0],
          'date'
        );
        Object.values(item)[0].length = 0;
        Object.values(item)[0].push(...itemsWithDatesSortedAsc);
      }
    }

    // set item type to first column type on page load
    if (!sortedListItems.length) {
      setListItem({
        ...listItem,
        type: categories[0]['type'],
      });
    }

    setSortedListItems(columnsData);
  }, [listItems, categories]);

  // set priority of next new item
  useEffect(() => {
    if (!listItem?.type) return;

    const selectedCategoryData = sortedListItems.find(
      (category) => Object.keys(category)[0] === listItem?.type
    );

    if (typeof selectedCategoryData === 'undefined') {
      setPriority(1);
      return;
    }

    const priorityOfNewItem = Object.values(selectedCategoryData)[0].length + 1;

    setPriority(priorityOfNewItem);
  }, [listItem, sortedListItems]);

  // ensure list item always has correct priorty of next new item
  useEffect(() => {
    if (!sortedListItems.length) return;

    setListItem({
      ...listItem,
      priority,
    });
  }, [priority]);

  // set global context user id
  useEffect(() => {
    setUserId(userId);
  }, []);

  // handle submit with Enter key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        !isUpdating ? handleOnSubmit() : handleEditSubmit();
      }
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [listItem]);

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
  };

  // create new item
  const handleOnSubmit = () => {
    if (!listItem?.title) {
      // TODO: create user notifications
      return;
    }

    setIsAwaitingAddResponse(true);
    submitTask(listItem).then((res) => {
      if (res.status === 200) {
        setListItems((current) => [...current, res.item]);
        if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();
        setListItem({ ...listItem, title: '' });
      }

      if (res.status !== 200) {
        setServerError(res.status);
        setShowToast(true);
      }

      setIsAwaitingAddResponse(false);
    });
  };

  // get item to edit
  const handleEditTask = (id) => {
    setIsAwaitingEditResponse(true);
    setTaskToEditId(id);
    getTask(id).then((res) => {
      if (res.status === 200) {
        setListItem(res.item);
        setIsUpdating(true);
      }

      if (res.status !== 200) {
        setServerError(res.status);
        setShowToast(true);
      }
      setIsAwaitingEditResponse(false);
    });
  };

  // edit item
  const handleEditSubmit = () => {
    if (!listItem?.title) {
      // TODO: create user notifications
      return;
    }

    setIsAwaitingUpdateResponse(true);
    updateTask(listItem).then((res) => {
      if (res.status === 200) {
        setListItems(
          listItems?.map((item) => {
            if (item?._id === taskToEditId) {
              return {
                ...item,
                title: res?.item?.title,
              };
            } else {
              return item;
            }
          })
        );
        setIsUpdating(false);
        setTaskToEditId('');
        setListItem({
          userId,
          title: '',
          column: res.item.column,
          type: res.item.type,
          priority,
          description: '',
          date: '',
          dateAndTime: '',
          mandatoryDate: false,
        });
      }

      if (res.status !== 200) {
        setServerError(res.status);
        setShowToast(true);
      }

      setIsAwaitingUpdateResponse(false);
    });
  };

  // delete item
  const handleDeleteTask = (id, confirmDeletion = false) => {
    if (confirmDeletion) {
      setShowModal(
        <Modal
          handleDeleteItem={handleDeleteTask}
          modalIdToDelete={id}
          headlineText={MODAL_CONFIRM_DELETION_HEADLINE}
        />
      );
      return;
    }

    setIsAwaitingDeleteResponse(true);
    deleteTask(id).then((res) => {
      if (res.status === 200) {
        setListItems(listItems.filter((item) => item._id !== id));

        if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();
      }

      if (res.status !== 200) {
        setServerError(res.status);
        setShowToast(true);
      }

      setShowModal(null);
      setIsAwaitingDeleteResponse(false);
    });
  };

  // cancel item edit
  const handleCancelEdit = () => {
    setIsUpdating(false);
    setTaskToEditId('');
    setListItem({
      userId,
      title: '',
      column: listItem.column,
      type: listItem.type,
      priority,
      description: '',
      date: '',
      dateAndTime: '',
      mandatoryDate: false,
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
      <MainControls
        categories={categories}
        handleOnSubmit={handleOnSubmit}
        handleEditSubmit={handleEditSubmit}
        title={listItem?.title}
        handleSetListItem={handleSetListItem}
        setListItem={setListItem}
        type={listItem?.type}
        column={listItem?.column}
        isUpdating={isUpdating}
        isAwaitingAddResponse={isAwaitingAddResponse}
        isAwaitingUpdateResponse={isAwaitingUpdateResponse}
        priority={priority}
      />
      {reminders && reminders?.length > 0 && (
        <Reminders reminders={reminders} />
      )}
      <div className='items-column-wrapper'>
        {sortedListItems?.map((item, index) => (
          <ItemsColumn
            key={`items-column_${index}`}
            heading={Object.keys(item)[0]}
            items={Object.values(item)[0]}
            setListItems={setListItems}
            handleEditTask={handleEditTask}
            handleCancelEdit={handleCancelEdit}
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
        {birthhdays && <BirthdaysColumn birthdays={birthhdays} />}
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  try {
    await connectDB();

    const { req, res } = context;
    const jwtSecret = process.env.JWT_SECRET;
    const token = getCookie('saturday', { req, res });
    let userId;

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(jwtSecret)
        );
        if (payload?.id) {
          userId = payload?.id;
        }
      } catch (error) {
        console.log(error);
      }
    }

    const tasks = await Task.find({ userId }).sort({
      priority: 1,
    });

    const categories = await Category.find({ userId }).sort({
      priority: 1,
    });

    const reminders = await Reminder.find({ userId }).sort({ reminderDate: 1 });

    return {
      props: {
        tasks: JSON.parse(JSON.stringify(tasks)),
        categories: JSON.parse(JSON.stringify(categories)),
        reminders: JSON.parse(JSON.stringify(reminders)),
        userId,
      },
    };
  } catch (error) {
    console.log(error);
  }
}

export default Home;
