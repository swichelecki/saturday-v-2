import { useState, useEffect, useRef } from 'react';
import connectDB from '../config/db';
import { useAppContext } from 'context';
import { getCookie } from 'cookies-next';
import { jwtVerify } from 'jose';
import Task from '../models/Task';
import {
  MainControls,
  ItemsColumn,
  BirthdaysColumn,
  Modal,
} from '../components';
import { useInnerWidth } from '../hooks';
import { useUpcomingBirthdays } from '../hooks';
import { submitTask, getTask, updateTask, deleteTask } from '../services';
import { MOBILE_BREAKPOINT } from '../constants';

const Home = ({ tasks, userId }) => {
  const width = useInnerWidth();
  const birthhdays = useUpcomingBirthdays();

  const modalRef = useRef(null);

  const { setUserId, setShowToast, setServerError } = useAppContext();

  const [listItems, setListItems] = useState(tasks);
  const [listItem, setListItem] = useState({
    userId,
    title: '',
    priority: '',
    type: '',
    description: '',
    date: '',
    dateAndTime: '',
  });
  const [type, setType] = useState('grocery');
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskToEditId, setTaskToEditId] = useState('');
  const [isAwaitingAddResponse, setIsAwaitingAddResponse] = useState(false);
  const [isAwaitingUpdateResponse, setIsAwaitingUpdateResponse] =
    useState(false);
  const [isAwaitingEditResponse, setIsAwaitingEditResponse] = useState(false);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [allItemsTouchReset, setAllItemsTouchReset] = useState(false);
  const [modalIdToDelete, setModalIdToDelete] = useState('');

  const allItems = [];
  const priority = listItems?.length > 0 ? listItems?.length + 1 : 1;

  // set global context user id
  useEffect(() => {
    setUserId(userId);
  }, []);

  // set state priority and type
  useEffect(() => {
    setListItem({ ...listItem, priority, type });
  }, [priority, type]);

  // handle submit with Enter key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        !isUpdating ? handleOnSubmit() : handleEditSubmit();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
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

  // set item title
  const handleSetListItem = (e) => {
    setListItem({ ...listItem, title: e.target.value });
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
          priority,
          type,
          description: '',
          date: '',
          dateAndTime: '',
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
  const handleDeleteTask = (id, confirmDeletion) => {
    if (confirmDeletion) {
      modalRef.current.showModal();
      setModalIdToDelete(id);
      return;
    }

    setIsAwaitingDeleteResponse(true);
    deleteTask(id).then((res) => {
      if (res.status === 200) {
        const filteredTasksArray = listItems.filter((item) => item._id !== id);
        setListItems(filteredTasksArray);
        if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();
      }

      if (res.status !== 200) {
        setServerError(res.status);
        setShowToast(true);
      }

      if (modalRef.current.open) modalRef.current.close();
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
      priority,
      type,
      description: '',
      date: '',
      dateAndTime: '',
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
        handleOnSubmit={handleOnSubmit}
        handleEditSubmit={handleEditSubmit}
        title={listItem?.title}
        handleSetListItem={handleSetListItem}
        setType={setType}
        type={type}
        isUpdating={isUpdating}
        isAwaitingAddResponse={isAwaitingAddResponse}
        isAwaitingUpdateResponse={isAwaitingUpdateResponse}
        priority={priority}
      />
      <div className='items-column-wrapper'>
        <ItemsColumn
          heading={'Grocery'}
          listItems={listItems}
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
        <ItemsColumn
          heading={'Big Box'}
          listItems={listItems}
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
        <ItemsColumn
          heading={'Other'}
          listItems={listItems}
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
        <ItemsColumn
          heading={'Upcoming'}
          listItems={listItems}
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
        {birthhdays && <BirthdaysColumn birthdays={birthhdays} />}
      </div>
      <Modal
        ref={modalRef}
        handleDeleteTask={handleDeleteTask}
        modalIdToDelete={modalIdToDelete}
        isAwaitingDeleteResponse={isAwaitingDeleteResponse}
      />
    </div>
  );
};

export async function getServerSideProps({ req, res }) {
  try {
    await connectDB();

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

    return {
      props: { tasks: JSON.parse(JSON.stringify(tasks)), userId },
    };
  } catch (error) {
    console.log(error);
  }
}

export default Home;
