import { useState, useEffect, useContext, useRef } from 'react';
import { TasksContext } from '../context/tasksContext';
import Link from 'next/link';
import { ListItem } from './';
import { submitTask, getTask, updateTask } from '../services';

const ContentLeft = ({ hasContent }) => {
  const { globalContextTasks, setGlobalContextTasks } =
    useContext(TasksContext);

  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  const [title, setTitle] = useState('');
  const [checkbox, setCheckbox] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskToEditId, setTaskToEditId] = useState('');
  const [taskToEdit, setTaskToEdit] = useState({});
  const [dragging, setDragging] = useState(false);
  const [isAwaitingAddResponse, setIsAwaitingAddResponse] = useState(false);
  const [isAwaitingUpdateResponse, setIsAwaitingUpdateResponse] =
    useState(false);
  const [isAwaitingEditResponse, setIsAwaitingEditResponse] = useState(false);

  const priority =
    globalContextTasks.length > 0 ? globalContextTasks.length + 1 : 1;

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

  const handleOnSubmit = () => {
    if (!title) {
      return;
    }

    const taskObject = {
      title,
      priority,
    };

    setIsAwaitingAddResponse(true);
    submitTask(taskObject).then((res) => {
      setGlobalContextTasks((current) => [...current, res.createTask]);
      setIsAwaitingAddResponse(false);
    });

    setTitle('');
  };

  const handleDeleteGlobalContextTask = (id) => {
    const filteredTasksArray = globalContextTasks.filter(
      (item) => item.id !== id
    );
    setGlobalContextTasks(filteredTasksArray);
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

  const handleEditSubmit = () => {
    if (!title) {
      return;
    }

    setIsAwaitingUpdateResponse(true);
    updateTask(taskToEditId, { ...taskToEdit, title }).then((res) => {
      setGlobalContextTasks(
        globalContextTasks.map((item) => {
          if (item?.id === taskToEditId) {
            return {
              ...item,
              title: res?.updateTask?.title,
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

  const handleDragStart = (index) => {
    dragItemRef.current = index;
    setTimeout(() => {
      setDragging(true);
    }, 0);
  };

  const handleDragEnter = (index) => {
    const dragItemIndex = dragItemRef.current;
    const dragOverItemIndex = index;
    if (index !== dragItemRef.current) {
      setGlobalContextTasks((currentGlobalContextTasks) => {
        let copyGlobalContextTasks = [...currentGlobalContextTasks];
        copyGlobalContextTasks.splice(
          dragOverItemIndex,
          0,
          copyGlobalContextTasks.splice(dragItemIndex, 1)[0]
        );
        dragItemRef.current = dragOverItemIndex;
        return copyGlobalContextTasks;
      });
    }
  };

  const handleDragEnd = () => {
    setDragging(false);
    dragItemRef.current = null;
    dragOverItemRef.current = null;

    const copyGlobalContextTasks = [...globalContextTasks];
    const tasksWithNewPriorities = copyGlobalContextTasks.map(
      (item, index) => ({
        ...item,
        priority: index + 1,
      })
    );
    tasksWithNewPriorities.forEach((item) => updateTask(item.id, item));
  };

  const handleDragStyles = (index) => {
    return dragItemRef.current === index
      ? 'list-item list-item-on-drag'
      : 'list-item';
  };

  return (
    <section
      className={`content-left-container${
        !hasContent ? ' content-left-container--no-right-column' : ''
      }`}
    >
      <div className='add-item'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={checkbox ? true : false}
        />
        {checkbox ? (
          <Link href={`/details?priority=${priority}`}>
            <span className='add-item__create-button'>Create</span>
          </Link>
        ) : isUpdating ? (
          <button
            onClick={handleEditSubmit}
            className='add-item__update-button'
          >
            {isAwaitingUpdateResponse && <div className='loader'></div>}
            Update
          </button>
        ) : (
          <button onClick={handleOnSubmit} className='add-item__add-button'>
            {isAwaitingAddResponse && <div className='loader'></div>}
            Add
          </button>
        )}
        <label className='add-item__checkbox-container' htmlFor='checkbox'>
          Create item with details
          <input
            type='checkbox'
            id='checkbox'
            onChange={(e) => {
              setCheckbox(e.target.checked);
            }}
          />
          <span className='add-item__checkmark'></span>
        </label>
      </div>
      {globalContextTasks?.map((item, index) => (
        <ListItem
          item={item}
          handleDeleteGlobalContextTask={handleDeleteGlobalContextTask}
          handleEditTask={handleEditTask}
          handleCancelEdit={handleCancelEdit}
          isAwaitingEditResponse={isAwaitingEditResponse}
          taskToEditId={taskToEditId}
          key={`list-item__${index}`}
          index={index}
          dragging={dragging}
          handleDragStyles={handleDragStyles}
          handleDragStart={handleDragStart}
          handleDragEnter={handleDragEnter}
          handleDragEnd={handleDragEnd}
        />
      ))}
    </section>
  );
};

export default ContentLeft;
