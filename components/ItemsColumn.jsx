import { useState, useEffect, useContext, useRef } from 'react';
import { TasksContext } from '../context/tasksContext';
import { useInnerWidth } from '../hooks';
import { ListItem } from './';
import { updateTask } from '../services';
import {
  FaShoppingCart,
  FaStore,
  FaCogs,
  FaCalendarCheck,
} from 'react-icons/fa';
import {
  MOBILE_BREAKPOINT,
  ITEM_REORDER_DRAG_EVENT,
  ITEM_REORDER_TOUCH_EVENT,
} from 'constants';

const ItemsColumn = ({
  heading,
  handleEditTask,
  handleCancelEdit,
  handleDeleteTask,
  taskToEditId,
  isAwaitingEditResponse,
  isAwaitingDeleteResponse,
  closeOpenItem,
  setAllItemsTouchReset,
  allItemsTouchReset,
}) => {
  const { globalContextTasks } = useContext(TasksContext);

  const width = useInnerWidth();

  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);
  const listItemWrapperRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [touchFilteredTasks, setTouchFilteredTasks] = useState([]);
  const [hideItemDetailsOnDrag, setHideItemDetailsOnDrag] = useState(false);

  useEffect(() => {
    if (width > MOBILE_BREAKPOINT) return;
    setTouchFilteredTasks(filteredTasks);
  }, [filteredTasks]);

  useEffect(() => {
    if (heading !== 'Upcoming') {
      setFilteredTasks(
        globalContextTasks?.filter(
          (item) => item?.type === heading?.toLowerCase()?.replace(' ', '-')
        )
      );
    } else {
      const filteredUpcomingTasks = globalContextTasks?.filter(
        (item) => item?.type === heading?.toLowerCase()?.replace(' ', '-')
      );

      const tasksWithFormattedDate = filteredUpcomingTasks.map((item) => {
        return {
          ...item,
          date: new Date(item?.date),
        };
      });

      const TasksSortedDateAsc = tasksWithFormattedDate.sort(
        (objA, objB) => Number(objA.date) - Number(objB.date)
      );

      const upcomingTasksSortedByDateAsc = TasksSortedDateAsc.map((item) => {
        return {
          ...item,
          date: new Date(item.date).toISOString().split('T')[0],
        };
      });

      setFilteredTasks(upcomingTasksSortedByDateAsc);
    }
  }, [globalContextTasks]);

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

  const handleDragStart = (index) => {
    dragItemRef.current = index;
    setTimeout(() => {
      setDragging(true);
    }, 0);
  };

  const handleDragEnter = (index, eventType) => {
    const dragItemIndex = dragItemRef.current;
    const dragOverItemIndex = index;

    if (index !== dragItemRef.current) {
      if (eventType === ITEM_REORDER_DRAG_EVENT) {
        setFilteredTasks(() => {
          const copyFilteredTasks = [...filteredTasks];
          copyFilteredTasks.splice(
            dragOverItemIndex,
            0,
            copyFilteredTasks.splice(dragItemIndex, 1)[0]
          );
          return copyFilteredTasks;
        });
      }

      if (eventType === ITEM_REORDER_TOUCH_EVENT) {
        setTouchFilteredTasks(() => {
          const copyTouchFilteredTasks = [...touchFilteredTasks];
          copyTouchFilteredTasks.splice(
            dragOverItemIndex,
            0,
            copyTouchFilteredTasks.splice(dragItemIndex, 1)[0]
          );
          return copyTouchFilteredTasks;
        });
      }

      dragItemRef.current = dragOverItemIndex;
    }
  };

  const handleDragEnd = (eventType) => {
    dragItemRef.current = null;
    dragOverItemRef.current = null;

    if (eventType === ITEM_REORDER_DRAG_EVENT) {
      setDragging(false);
      setHideItemDetailsOnDrag(false);
      const tasksWithNewPriorities = filteredTasks?.map((item, index) => ({
        ...item,
        priority: index + 1,
      }));

      tasksWithNewPriorities?.forEach((item) => updateTask(item));
    }

    if (eventType === ITEM_REORDER_TOUCH_EVENT) {
      const touchTasksWithNewPriorities = touchFilteredTasks?.map(
        (item, index) => ({
          ...item,
          priority: index + 1,
        })
      );

      touchTasksWithNewPriorities?.forEach((item) => updateTask(item));

      setFilteredTasks(touchTasksWithNewPriorities);
    }
  };

  const handleDragStyles = (index) => {
    return dragItemRef.current === index
      ? 'list-item__outer-wrapper list-item-on-drag'
      : 'list-item__outer-wrapper';
  };

  if (!filteredTasks?.length) {
    return null;
  }

  return (
    <div className='items-column'>
      <h2>
        {handleIcon(heading)}
        {heading}
      </h2>
      <div className='items-column__list-item-wrapper' ref={listItemWrapperRef}>
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
            closeOpenItem={closeOpenItem}
            setAllItemsTouchReset={setAllItemsTouchReset}
            allItemsTouchReset={allItemsTouchReset}
            hideItemDetailsOnDrag={hideItemDetailsOnDrag}
            setHideItemDetailsOnDrag={setHideItemDetailsOnDrag}
            listItemWrapperRef={listItemWrapperRef}
            numberOfItemsInColumn={filteredTasks?.length}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemsColumn;
