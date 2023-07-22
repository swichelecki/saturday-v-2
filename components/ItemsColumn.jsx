import { useState, useContext, useRef } from 'react';
import { TasksContext } from '../context/tasksContext';
import { ListItem } from './';
import { updateTask } from '../services';
import {
  FaShoppingCart,
  FaStore,
  FaCogs,
  FaCalendarCheck,
} from 'react-icons/fa';

const ItemsColumn = ({
  heading,
  handleEditTask,
  handleCancelEdit,
  handleDeleteTask,
  taskToEditId,
  isAwaitingEditResponse,
  isAwaitingDeleteResponse,
}) => {
  const { globalContextTasks, setGlobalContextTasks } =
    useContext(TasksContext);

  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  const [dragging, setDragging] = useState(false);

  let filteredTasks = globalContextTasks.filter(
    (item) => item.type === heading.toLowerCase().replace(' ', '-')
  );

  if (heading === 'Upcoming') {
    const tasksWithFormattedDate = filteredTasks?.map((item) => {
      return {
        ...item,
        date: new Date(item?.date),
      };
    });

    const TasksSortedDateAsc = tasksWithFormattedDate.sort(
      (objA, objB) => Number(objA.date) - Number(objB.date)
    );

    filteredTasks = TasksSortedDateAsc.map((item) => {
      return {
        ...item,
        date: new Date(item.date).toISOString().split('T')[0],
      };
    });
  }

  const handleIcon = (heading) => {
    let icon;
    switch (heading) {
      case 'Grocery':
        icon = <FaShoppingCart />;
        break;
      case 'Big Box':
        icon = <FaStore />;
        break;
      case 'Other':
        icon = <FaCogs />;
        break;
      case 'Upcoming':
        icon = <FaCalendarCheck />;
        break;
      default:
        icon = '';
    }
    return icon;
  };

  // TODO: DRAG RESORTING NEEDS TO BE UPDATED
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
    const tasksWithNewPriorities = copyGlobalContextTasks?.map(
      (item, index) => ({
        ...item,
        priority: index + 1,
      })
    );
    tasksWithNewPriorities?.forEach((item) => updateTask(item));
  };

  const handleDragStyles = (index) => {
    return dragItemRef.current === index
      ? 'list-item__outer-wrapper list-item-on-drag'
      : 'list-item__outer-wrapper';
  };

  if (!filteredTasks.length) {
    return null;
  }

  return (
    <div className='items-column'>
      <h2>
        {handleIcon(heading)}
        {heading}
      </h2>
      {filteredTasks?.map((item, index) => (
        <ListItem
          item={item}
          handleEditTask={handleEditTask}
          handleCancelEdit={handleCancelEdit}
          handleDeleteTask={handleDeleteTask}
          isAwaitingEditResponse={isAwaitingEditResponse}
          isAwaitingDeleteResponse={isAwaitingDeleteResponse}
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
    </div>
  );
};

export default ItemsColumn;
