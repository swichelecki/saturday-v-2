import { useState, useEffect, useRef } from 'react';
import { ListItem } from './';
import { useAppContext } from 'context';
import { updateTask } from '../services';

const ItemsColumn = ({
  heading,
  items,
  setListItems,
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
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);
  const listItemWrapperRef = useRef(null);

  const { setShowToast, setServerError } = useAppContext();

  const [draggableItems, setDraggableItems] = useState([]);

  useEffect(() => {
    const copyOfListItems = [...items];
    setDraggableItems(copyOfListItems);
  }, [items]);

  const handleDragStart = (index) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index) => {
    const dragItemIndex = dragItemRef.current;
    const dragOverItemIndex = index;

    if (index !== dragItemRef.current) {
      setDraggableItems(() => {
        draggableItems.splice(
          dragOverItemIndex,
          0,
          draggableItems.splice(dragItemIndex, 1)[0]
        );
        return draggableItems;
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

    draggableItemsWithNewPriorities?.forEach((item) =>
      updateTask(item).then((res) => {
        if (res.status !== 200) {
          setServerError(res.status);
          setShowToast(true);
        }
      })
    );

    setListItems((current) => {
      return [
        ...draggableItemsWithNewPriorities,
        ...current.filter((item) => item.type !== heading),
      ];
    });
  };

  if (!items?.length) {
    return null;
  }

  return (
    <div className='items-column'>
      <h2>{heading}</h2>
      <div className='items-column__list-item-wrapper' ref={listItemWrapperRef}>
        {items?.map((item, index) => (
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
            numberOfItemsInColumn={items?.length}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemsColumn;
