import { useState, useEffect } from 'react';
import connectDB from '../config/db';
import Task from '../models/Task';
import { TasksContext } from '../context/tasksContext';
import { MainControls, ItemsColumn, Birthdays } from '../components';
import { useUpcomingBirthdays } from '../hooks';
import { submitTask, getTask, updateTask, deleteTask } from '../services';

const Home = ({ tasks }) => {
  const birthhdays = useUpcomingBirthdays();

  const [globalContextTasks, setGlobalContextTasks] = useState(tasks);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('grocery');
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskToEditId, setTaskToEditId] = useState('');
  const [taskToEdit, setTaskToEdit] = useState({});
  const [isAwaitingAddResponse, setIsAwaitingAddResponse] = useState(false);
  const [isAwaitingUpdateResponse, setIsAwaitingUpdateResponse] =
    useState(false);
  const [isAwaitingEditResponse, setIsAwaitingEditResponse] = useState(false);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);

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
  }, [title]);

  const priority =
    globalContextTasks?.length > 0 ? globalContextTasks?.length + 1 : 1;

  const handleOnSubmit = () => {
    if (!title) {
      return;
    }

    const taskObject = {
      title,
      priority,
      type,
      description: null,
      date: null,
      dateAndTime: null,
    };

    setIsAwaitingAddResponse(true);
    submitTask(taskObject).then((res) => {
      setGlobalContextTasks((current) => [...current, res]);
      setIsAwaitingAddResponse(false);
    });

    setTitle('');
  };

  const handleEditSubmit = () => {
    if (!title) {
      return;
    }

    setIsAwaitingUpdateResponse(true);
    updateTask({ ...taskToEdit, title }).then((res) => {
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
    setTitle('');
  };

  const handleDeleteTask = (id) => {
    setIsAwaitingDeleteResponse(true);
    deleteTask(id).then((res) => {
      const filteredTasksArray = globalContextTasks.filter(
        (item) => item._id !== id
      );
      setGlobalContextTasks(filteredTasksArray);
      setIsAwaitingDeleteResponse(false);
    });
  };

  const handleCancelEdit = () => {
    setIsUpdating(false);
    setTaskToEditId('');
    setTitle('');
  };

  const handleEditTask = (id) => {
    setIsAwaitingEditResponse(true);
    setTaskToEditId(id);
    getTask(id).then((res) => {
      setTitle(res?.title);
      setTaskToEdit(res);
      setIsUpdating(true);
      setIsAwaitingEditResponse(false);
    });
  };

  return (
    <div className='content-container'>
      <TasksContext.Provider
        value={{ globalContextTasks, setGlobalContextTasks }}
      >
        <MainControls
          handleOnSubmit={handleOnSubmit}
          handleEditSubmit={handleEditSubmit}
          setTitle={setTitle}
          title={title}
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
          />
          <ItemsColumn
            heading={'Big Box'}
            handleEditTask={handleEditTask}
            handleCancelEdit={handleCancelEdit}
            handleDeleteTask={handleDeleteTask}
            taskToEditId={taskToEditId}
            isAwaitingEditResponse={isAwaitingEditResponse}
            isAwaitingDeleteResponse={isAwaitingDeleteResponse}
          />
          <ItemsColumn
            heading={'Other'}
            handleEditTask={handleEditTask}
            handleCancelEdit={handleCancelEdit}
            handleDeleteTask={handleDeleteTask}
            taskToEditId={taskToEditId}
            isAwaitingEditResponse={isAwaitingEditResponse}
            isAwaitingDeleteResponse={isAwaitingDeleteResponse}
          />
          <ItemsColumn
            heading={'Upcoming'}
            handleEditTask={handleEditTask}
            handleCancelEdit={handleCancelEdit}
            handleDeleteTask={handleDeleteTask}
            taskToEditId={taskToEditId}
            isAwaitingEditResponse={isAwaitingEditResponse}
            isAwaitingDeleteResponse={isAwaitingDeleteResponse}
          />
        </div>
      </TasksContext.Provider>
      {birthhdays && <Birthdays />}
    </div>
  );
};

export async function getServerSideProps() {
  await connectDB();

  try {
    const tasks = await Task.find().sort({ priority: 1 });

    return {
      props: { tasks: JSON.parse(JSON.stringify(tasks)) } ?? [],
    };
  } catch (error) {
    console.log(error);
  }
}

export default Home;
