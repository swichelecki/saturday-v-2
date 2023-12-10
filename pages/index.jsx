import { useState, useEffect, useRef } from 'react';
import connectDB from '../config/db';
import Task from '../models/Task';
import { TasksContext } from '../context/tasksContext';
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

const Home = ({ tasks }) => {
  const width = useInnerWidth();
  const birthhdays = useUpcomingBirthdays();

  const modalRef = useRef(null);

  const [globalContextTasks, setGlobalContextTasks] = useState(tasks);
  const [listItem, setListItem] = useState({
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
  const priority =
    globalContextTasks?.length > 0 ? globalContextTasks?.length + 1 : 1;

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
      setGlobalContextTasks((current) => [...current, res]);
      setIsAwaitingAddResponse(false);
      if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();
    });

    setListItem({ ...listItem, title: '' });
  };

  // get item to edit
  const handleEditTask = (id) => {
    setIsAwaitingEditResponse(true);
    setTaskToEditId(id);
    getTask(id).then((res) => {
      setListItem(res);
      setIsUpdating(true);
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
      setGlobalContextTasks(
        globalContextTasks?.map((item) => {
          if (item?._id === taskToEditId) {
            return {
              ...item,
              title: res?.title,
            };
          } else {
            return item;
          }
        })
      );
      setIsAwaitingUpdateResponse(false);
      setIsUpdating(false);
      setTaskToEditId('');
    });
    setListItem({ ...listItem, title: '' });
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
      const filteredTasksArray = globalContextTasks.filter(
        (item) => item._id !== id
      );
      setGlobalContextTasks(filteredTasksArray);
      setIsAwaitingDeleteResponse(false);
      if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();
      if (modalRef.current.open) modalRef.current.close();
    });
  };

  // cancel item edit
  const handleCancelEdit = () => {
    setIsUpdating(false);
    setTaskToEditId('');
    setListItem({ ...listItem, title: '' });
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
      <TasksContext.Provider
        value={{ globalContextTasks, setGlobalContextTasks }}
      >
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
      </TasksContext.Provider>
    </div>
  );
};

export async function getServerSideProps() {
  await connectDB();

  const tasks = await Task.find().sort({ priority: 1 });

  return {
    props: { tasks: JSON.parse(JSON.stringify(tasks)) } ?? [],
  };
}

export default Home;
