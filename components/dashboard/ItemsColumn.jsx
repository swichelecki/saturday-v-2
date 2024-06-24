'use client';

import { useState, useEffect, useRef } from 'react';
import { ListItem } from '../../components';
import { useAppContext } from '../../context';
import { updateItem } from '../../actions';

const ItemsColumn = ({
  heading,
  items,
  setListItems,
  handleEditTask,
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

    draggableItemsWithNewPriorities?.forEach((item) => {
      const formData = new FormData();
      for (let key in item) {
        if (key !== 'date' && key !== 'dateAndTime') {
          formData.append(key, item[key]);
        }
      }

      updateItem(formData).then((res) => {
        if (res.status !== 200) {
          setServerError(res.status);
          setShowToast(true);
        }
      });
    });

    setListItems((current) => {
      const columnsDataWithResortedItems = [
        ...current.filter((item) => Object.keys(item)[0] !== heading),
        { [heading]: draggableItemsWithNewPriorities },
      ];

      const columnsDataSortedByColumnNumber = columnsDataWithResortedItems.sort(
        (objA, objB) =>
          Object.values(objA)[0][0]?.column - Object.values(objB)[0][0]?.column
      );

      return columnsDataSortedByColumnNumber;
    });
  };

  if (!items?.length) {
    return <></>;
  }

  return (
    <div className='items-column'>
      <h2>{heading}</h2>
      <div className='items-column__list-item-wrapper' ref={listItemWrapperRef}>
        {items?.map((item, index) => (
          <ListItem
            item={item}
            handleEditTask={handleEditTask}
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
