'use client';

import { useState, useEffect, useRef } from 'react';
import { ListItem, Toast } from '../../components';
import { useAppContext } from '../../context';
import { updateItem } from '../../actions';
import { ITEM_TYPE_DASHBOARD } from '../../constants';

const ItemsColumn = ({
  heading,
  items,
  setListItems,
  getItemToUpdate,
  handleDeleteItem,
  itemToUpdateId,
  isAwaitingEditResponse,
  isAwaitingDeleteResponse,
  timezone,
  totalNumberOfItems,
}) => {
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);
  const listItemWrapperRef = useRef(null);

  const { setShowToast } = useAppContext();

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
        date: '',
        dateAndTime: '',
      })
    );

    draggableItemsWithNewPriorities?.forEach((item) => {
      updateItem({
        ...item,
        itemLimit: totalNumberOfItems,
        isDetailsForm: false,
      }).then((res) => {
        if (res.status !== 200) {
          setShowToast(<Toast serverError={res} />);
        }
      });
    });

    setListItems((current) => {
      return current.map((item) => {
        if (Object.keys(item)[0] !== heading) {
          return item;
        } else {
          return { [heading]: draggableItemsWithNewPriorities };
        }
      });
    });
  };

  if (!items?.length) return <></>;

  return (
    <div className='items-column'>
      <h2>{heading}</h2>
      <div className='items-column__list-item-wrapper' ref={listItemWrapperRef}>
        {items?.map((item, index) => (
          <ListItem
            item={item}
            getItemToUpdate={getItemToUpdate}
            handleDeleteItem={handleDeleteItem}
            isAwaitingEditResponse={isAwaitingEditResponse}
            isAwaitingDeleteResponse={isAwaitingDeleteResponse}
            itemToUpdateId={itemToUpdateId}
            key={`list-item__${index}`}
            index={index}
            handleDragStart={handleDragStart}
            handleDragEnter={handleDragEnter}
            handleDragEnd={handleDragEnd}
            listItemWrapperRef={listItemWrapperRef}
            numberOfItemsInColumn={items?.length}
            itemType={ITEM_TYPE_DASHBOARD}
            timezone={timezone}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemsColumn;
