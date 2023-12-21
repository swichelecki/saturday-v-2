import { useState, useEffect, useContext, useRef } from 'react';
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
  closeOpenItem,
  setAllItemsTouchReset,
  allItemsTouchReset,
}) => {
  const { globalContextTasks } = useContext(TasksContext);

  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);
  const listItemWrapperRef = useRef(null);

  const [filteredItems, setFilteredItems] = useState([]);
  const [draggableItems, setDraggableItems] = useState([]);

  useEffect(() => {
    setDraggableItems(filteredItems);
  }, [filteredItems]);

  useEffect(() => {
    if (heading !== 'Upcoming') {
      setFilteredItems(
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

      setFilteredItems(upcomingTasksSortedByDateAsc);
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
  };

  const handleDragEnter = (index) => {
    const dragItemIndex = dragItemRef.current;
    const dragOverItemIndex = index;

    if (index !== dragItemRef.current) {
      setDraggableItems(() => {
        const copyDraggableItems = [...draggableItems];
        copyDraggableItems.splice(
          dragOverItemIndex,
          0,
          copyDraggableItems.splice(dragItemIndex, 1)[0]
        );
        return copyDraggableItems;
      });
      dragItemRef.current = dragOverItemIndex;
    }
  };

  const handleDragEnd = () => {
    dragItemRef.current = null;
    dragOverItemRef.current = null;

    const draggableItemsWithNewPriorities = draggableItems?.map(
      (item, index) => ({
        ...item,
        priority: index + 1,
      })
    );

    draggableItemsWithNewPriorities?.forEach((item) => updateTask(item));

    setFilteredItems(draggableItemsWithNewPriorities);
  };

  if (!filteredItems?.length) {
    return null;
  }

  return (
    <div className='items-column'>
      <h2>
        {handleIcon(heading)}
        {heading}
      </h2>
      <div className='items-column__list-item-wrapper' ref={listItemWrapperRef}>
        {filteredItems?.map((item, index) => (
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
            handleDragStart={handleDragStart}
            handleDragEnter={handleDragEnter}
            handleDragEnd={handleDragEnd}
            closeOpenItem={closeOpenItem}
            setAllItemsTouchReset={setAllItemsTouchReset}
            allItemsTouchReset={allItemsTouchReset}
            listItemWrapperRef={listItemWrapperRef}
            numberOfItemsInColumn={filteredItems?.length}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemsColumn;
