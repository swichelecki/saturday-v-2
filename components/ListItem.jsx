import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ItemButtons from './ItemButtons';
import { useInnerWidth } from '../hooks';
import { handleTodaysDateCheck, handleTransitionSpeed } from 'utilities';
import moment from 'moment-timezone';
import { GrDrag } from 'react-icons/gr';
import { MdEdit } from 'react-icons/md';
import { TbChevronRight } from 'react-icons/tb';
import {
  OPEN_CLOSE_THRESHOLD,
  TOUCH_DURATION_THRESHOLD,
  MAX_MOVE_DISTANCE,
  MOBILE_BREAKPOINT,
  ITEM_REORDER_TOUCH_EVENT,
  ITEM_REORDER_DRAG_EVENT,
} from 'constants';

let previousItemId = '';

const ItemList = ({
  item,
  handleEditTask,
  handleCancelEdit,
  handleDeleteTask,
  isAwaitingEditResponse,
  isAwaitingDeleteResponse,
  taskToEditId,
  index,
  dragging,
  handleDragStyles,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
  closeOpenItem,
  setAllItemsTouchReset,
  allItemsTouchReset,
  hideItemDetailsOnDrag,
  setHideItemDetailsOnDrag,
  listItemWrapperRef,
  numberOfItemsInColumn,
}) => {
  const width = useInnerWidth();

  const startingIndexRef = useRef(null);
  const detailsRef = useRef(null);
  const listItemRef = useRef(null);
  const itemRef = useRef(null);
  const animationIdRef = useRef(null);
  const animationYIdRef = useRef(null);
  const detailsRefCurrent = detailsRef.current;
  const arrayOfListItemsRef = useRef(null);
  const arrayOfListItemsRefCurr = arrayOfListItemsRef.current;

  const [isOpen, setIsOpen] = useState(false);
  // state for x-axis animation
  const [startXPosition, setStartXPosition] = useState(0);
  const [startYPosition, setStartYPosition] = useState(0);
  const [itemPositionOnStart, setItemPositionOnStart] = useState(0);
  const [itemPositionOnEnd, setItemPositionOnEnd] = useState(0);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [previousTranslateX, setPreviousTranslateX] = useState(0);
  const [movedBy, setMovedBy] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // state for y-axis animation
  //const [listItemHeight, setListItemHeight] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [listItemYPositionOnStart, setListItemYPositionOnStart] = useState(0);
  const [isTouchMove, setIsTouchMove] = useState(false);

  // get array of column list items for touch y-axis dom manipulation
  useEffect(() => {
    const listItemWrapper = listItemWrapperRef.current;
    arrayOfListItemsRef.current = [
      ...listItemWrapper.querySelectorAll('.list-item__outer-wrapper'),
    ];
  }, [numberOfItemsInColumn]);

  // set column wrapper height on mobile
  /*   useEffect(() => {
    if (width <= MOBILE_BREAKPOINT && index === 0) {
      setListItemHeight(listItemRef.current.clientHeight);
    }
  }, [listItemRef, index, width]); */

  // when all items are closed automatically make sure state is reset for next item touch
  useEffect(() => {
    if (allItemsTouchReset) {
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
      setAllItemsTouchReset(false);
    }
  }, [allItemsTouchReset]);

  // disable scrolling when opening and closing items on touch
  useEffect(() => {
    const handlePreventScroll = (e) => {
      if (itemRef.current.style.transform !== 'translateX(0px)') {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    itemRef.current.addEventListener(
      'touchmove',
      (e) => handlePreventScroll(e),
      { passive: false }
    );

    return () => {
      itemRef.current?.removeEventListener(
        'touchmove',
        (e) => handlePreventScroll(e),
        { passive: false }
      );
    };
  }, []);

  // handle touch transitions after touchend event
  useEffect(() => {
    if (currentTranslateX === previousTranslateX) return;

    // open item on swipe or when touchmove exceeds open threshold
    if (
      (duration < TOUCH_DURATION_THRESHOLD &&
        itemPositionOnEnd < itemPositionOnStart) ||
      (duration >= TOUCH_DURATION_THRESHOLD &&
        movedBy >= OPEN_CLOSE_THRESHOLD &&
        itemPositionOnEnd < itemPositionOnStart)
    ) {
      const transitionSpeed = handleTransitionSpeed(movedBy, duration);
      itemRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      itemRef.current.style.transform = `translateX(-146px)`;
      setCurrentTranslateX(MAX_MOVE_DISTANCE);
      setPreviousTranslateX(MAX_MOVE_DISTANCE);
    }

    // close item on swipe or when touchmove exceeds close threshold
    if (
      (duration < TOUCH_DURATION_THRESHOLD &&
        itemPositionOnEnd > itemPositionOnStart) ||
      (duration >= TOUCH_DURATION_THRESHOLD &&
        movedBy > OPEN_CLOSE_THRESHOLD &&
        itemPositionOnEnd > itemPositionOnStart)
    ) {
      const transitionSpeed = handleTransitionSpeed(movedBy, duration);
      itemRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      itemRef.current.style.transform = 'translateX(0px)';
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
    }

    // when closed, return item to close state when touchmove does not exceed open threshold
    if (
      duration >= TOUCH_DURATION_THRESHOLD &&
      movedBy < OPEN_CLOSE_THRESHOLD &&
      itemPositionOnStart === 0
    ) {
      const transitionSpeed = handleTransitionSpeed(movedBy, duration);
      itemRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      itemRef.current.style.transform = 'translateX(0px)';
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
    }

    // when open, return item to open state when touchmove does not exceed close threshold
    if (
      duration >= TOUCH_DURATION_THRESHOLD &&
      movedBy < OPEN_CLOSE_THRESHOLD &&
      itemPositionOnStart === MAX_MOVE_DISTANCE
    ) {
      const transitionSpeed = handleTransitionSpeed(movedBy, duration);
      itemRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      itemRef.current.style.transform = 'translateX(-146px)';
      setCurrentTranslateX(MAX_MOVE_DISTANCE);
      setPreviousTranslateX(MAX_MOVE_DISTANCE);
    }
  }, [duration, movedBy]);

  // initialize animation
  useEffect(() => {
    animationIdRef.current = requestAnimationFrame(animation);
    animationYIdRef.current = requestAnimationFrame(animationY);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      cancelAnimationFrame(animationYIdRef.current);
    };
  }, []);

  // touch start
  const handleTouchStart = (e) => {
    // after item closes when new item is opened state must be reset on previously opened item
    if (itemRef.current.id !== previousItemId) {
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
    }
    previousItemId = closeOpenItem(itemRef.current.id);
    setStartXPosition(e.touches[0].clientX);
    setStartYPosition(e.touches[0].clientY);
    itemRef.current.style.transition = 'none';
    setItemPositionOnStart(itemRef.current.getBoundingClientRect().left);
    setStartTime(new Date().getTime());
  };

  // touch move
  const handleTouchMove = (e) => {
    // if touch move is up or down end touch move
    if (
      Math.max(
        e.touches[0].clientY - startYPosition,
        startYPosition - e.touches[0].clientY
      ) >
      Math.max(
        e.touches[0].clientX - startXPosition,
        startXPosition - e.touches[0].clientX
      )
    )
      return;

    if (isOpen) return;
    let currentPosition = e.touches[0].clientX;
    setCurrentTranslateX(previousTranslateX + currentPosition - startXPosition);
    animationIdRef.current = requestAnimationFrame(animation);
  };

  // touch end
  const handleTouchEnd = () => {
    setMovedBy(Math.abs(currentTranslateX - previousTranslateX));
    setDuration(new Date().getTime() - startTime);
    setItemPositionOnEnd(itemRef.current.getBoundingClientRect().left);
    cancelAnimationFrame(animationIdRef.current);
  };

  // animate open and close item on touchmove
  const animation = () => {
    const itemTranslateX = Math.max(
      MAX_MOVE_DISTANCE,
      Math.min(currentTranslateX, 0)
    );
    itemRef.current.style.transform = `translateX(${itemTranslateX}px)`;
  };

  // TODO: still not working --- disable scrolling on touch y-axis move
  useEffect(() => {
    const handlePreventScroll = (e) => {
      if (isTouchMove) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    itemRef.current.addEventListener(
      'touchmove',
      (e) => handlePreventScroll(e),
      { passive: false }
    );

    return () => {
      itemRef.current?.removeEventListener(
        'touchmove',
        (e) => handlePreventScroll(e),
        { passive: false }
      );
    };
  }, [isTouchMove]);

  // touch y-axis start
  const handleTouchYStart = (e) => {
    setIsTouchMove(true);
    handleDragStart(index);
    setStartYPosition(e.touches[0].clientY);
    setListItemYPositionOnStart(listItemRef.current.clientHeight * index);
    startingIndexRef.current = index;

    // set height of list item wrapper
    const handleWrapperHeight = (numberOfItems) => {
      return numberOfItems * listItemRef.current.clientHeight;
    };

    listItemWrapperRef.current.setAttribute(
      'style',
      `height: ${handleWrapperHeight(numberOfItemsInColumn)}px`
    );

    // on first touch start position top is set on each absolute item
    arrayOfListItemsRefCurr?.forEach((item, i) => {
      item.style.position = 'absolute';
      item.style.top = `${item.clientHeight * i}px`;
      item.style.left = '0';
      item.style.right = '0';
      item.style.zIndex = '1';
    });

    listItemRef.current.style.zIndex = '2';
  };

  // touch y-axis move
  const handleTouchYMove = (e) => {
    if (isOpen) return;

    let currentPosition = e.touches[0].clientY;

    setCurrentTranslateY(
      Math.max(
        0,
        Math.min(
          listItemYPositionOnStart + currentPosition - startYPosition,
          listItemWrapperRef.current.clientHeight -
            listItemRef.current.clientHeight
        )
      )
    );

    animationYIdRef.current = requestAnimationFrame(animationY);

    // move up and trigger array resort and dom update
    if (
      currentTranslateY > 0 &&
      currentTranslateY <
        listItemRef.current.clientHeight * (startingIndexRef.current - 1) +
          listItemRef.current.clientHeight / 2
    ) {
      startingIndexRef.current -= 1;

      handleDragEnter(startingIndexRef.current, ITEM_REORDER_TOUCH_EVENT);

      arrayOfListItemsRefCurr?.forEach((item) => {
        // moves item down when item dragged over it
        if (parseInt(item.dataset.listItemIndex) === startingIndexRef.current) {
          item.style.top = `${
            item.clientHeight * (parseInt(item.dataset.listItemIndex) + 1)
          }px`;
          item.setAttribute(
            'data-list-item-index',
            parseInt(item.dataset.listItemIndex) + 1
          );
        }

        // sets new index for item being dragged
        if (
          parseInt(item.dataset.listItemIndex) ===
          startingIndexRef.current + 1
        ) {
          item.setAttribute(
            'data-list-item-index',
            parseInt(item.dataset.listItemIndex)
          );
        }
      });
    }

    // move down and trigger array resort and dom update
    if (
      currentTranslateY <
        listItemWrapperRef.current.clientHeight -
          listItemRef.current.clientHeight &&
      currentTranslateY >
        listItemRef.current.clientHeight * startingIndexRef.current +
          listItemRef.current.clientHeight / 2
    ) {
      startingIndexRef.current += 1;

      handleDragEnter(startingIndexRef.current, ITEM_REORDER_TOUCH_EVENT);

      arrayOfListItemsRefCurr?.forEach((item) => {
        // moves item up when item dragged over it
        if (parseInt(item.dataset.listItemIndex) === startingIndexRef.current) {
          item.style.top = `${
            item.clientHeight * (parseInt(item.dataset.listItemIndex) - 1)
          }px`;
          item.setAttribute(
            'data-list-item-index',
            parseInt(item.dataset.listItemIndex) - 1
          );
        }

        // sets new index for item being dragged
        if (
          parseInt(item.dataset.listItemIndex) ===
          startingIndexRef.current - 1
        ) {
          item.setAttribute(
            'data-list-item-index',
            parseInt(item.dataset.listItemIndex)
          );
        }
      });
    }
  };

  // touch y-axis end
  const handleTouchYEnd = () => {
    setIsTouchMove(false);
    listItemWrapperRef.current.removeAttribute('style');

    handleDragEnd(ITEM_REORDER_TOUCH_EVENT);

    arrayOfListItemsRefCurr?.forEach((item, i) => {
      item.style.position = 'relative';
      item.style.top = 'unset';
      item.style.left = 'unset';
      item.style.bottom = 'unset';
      item.style.right = 'unset';
      item.style.zIndex = '1';
      item.setAttribute('data-list-item-index', parseInt(i));
    });

    cancelAnimationFrame(animationYIdRef.current);
  };

  // animate y-axis
  const animationY = () => {
    listItemRef.current.style.top = `${currentTranslateY}px`;
  };

  const handleShowDetails = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleHiddenHeight = (el) => {
    if (!el?.cloneNode) {
      return null;
    }

    const clone = el.cloneNode(true);

    Object.assign(clone.style, {
      overflow: 'visible',
      height: 'auto',
      maxHeight: 'none',
      opacity: '0',
      visibility: 'hidden',
      display: 'block',
    });

    el.after(clone);
    const height = clone.offsetHeight;
    clone.remove();

    return height;
  };

  const isToday =
    item?.type === 'upcoming' ? handleTodaysDateCheck(item?.date) : null;

  return (
    <div
      className={
        dragging && width > MOBILE_BREAKPOINT
          ? handleDragStyles(index)
          : 'list-item__outer-wrapper'
      }
      ref={listItemRef}
      style={item?.type === 'upcoming' ? { cursor: 'default' } : {}}
      data-list-item-index={index}
      draggable={item?.type !== 'upcoming'}
      onDragStart={() => {
        handleDragStart(index);
        setHideItemDetailsOnDrag(true);
      }}
      onDragEnter={
        dragging
          ? () => {
              handleDragEnter(index, ITEM_REORDER_DRAG_EVENT);
            }
          : null
      }
      onDragEnd={() => {
        handleDragEnd(ITEM_REORDER_DRAG_EVENT);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        className={`list-item__inner-wrapper ${
          item?.dateAndTime || item?.date
            ? 'list-item__inner-wrapper--upcoming'
            : ''
        }`}
      >
        {(item?.dateAndTime || item?.date) && (
          <div
            className={`list-item__upcoming-date-time${
              isToday ? ' list-item__upcoming-date-time--is-today' : ''
            }`}
          >
            {item?.dateAndTime ? (
              <p>
                {isToday && 'Today,'}{' '}
                {moment(item?.dateAndTime)
                  .tz('America/Chicago')
                  .format('dddd, MMMM D,')}{' '}
                {moment(item?.dateAndTime)
                  .tz('America/Chicago')
                  .format('h:mm A')}{' '}
              </p>
            ) : (
              <p>
                {isToday && 'Today, '}
                {moment(item?.date).format('dddd, MMMM D')}
              </p>
            )}
          </div>
        )}
        <div
          ref={itemRef}
          className='list-item__item'
          id={`${item?.type}_index_${index}`}
        >
          {item?.type !== 'upcoming' && (
            <div
              className='list-item__item-drag-zone'
              onTouchStart={(e) => handleTouchYStart(e)}
              onTouchMove={(e) => handleTouchYMove(e)}
              onTouchEnd={handleTouchYEnd}
            >
              <GrDrag />
            </div>
          )}
          <div
            className={`list-item__item-hover-zone ${
              item?.type === 'upcoming'
                ? 'list-item__item-hover-zone--upcoming'
                : ''
            }`}
            onTouchStart={(e) => handleTouchStart(e)}
            onTouchMove={(e) => handleTouchMove(e)}
            onTouchEnd={handleTouchEnd}
          >
            <p>{item?.title}</p>
            {width <= 600 && <TbChevronRight />}
          </div>
          <div className='list-item__item-right'>
            {width > 600 && (
              <ItemButtons
                date={item?.date}
                dateAndTime={item?.dateAndTime}
                description={item?.description}
                confirmDeletion={item?.confirmDeletion}
                handleShowDetails={handleShowDetails}
                isOpen={isOpen}
                taskToEditId={taskToEditId}
                handleEditTask={handleEditTask}
                itemId={item?._id}
                isAwaitingEditResponse={isAwaitingEditResponse}
                handleCancelEdit={handleCancelEdit}
                handleDeleteTask={handleDeleteTask}
                setIsOpen={setIsOpen}
                isAwaitingDeleteResponse={isAwaitingDeleteResponse}
              />
            )}
          </div>
        </div>
        {!hideItemDetailsOnDrag && (
          <div
            ref={detailsRef}
            className='list-item__details'
            style={
              isOpen
                ? {
                    height: `${handleHiddenHeight(detailsRefCurrent)}px`,
                  }
                : { height: '0px' }
            }
          >
            <div className='list-item__details-padding'>
              {item?.description && (
                <div
                  className='list-item__details-quill-wrapper'
                  dangerouslySetInnerHTML={{ __html: item?.description }}
                />
              )}
              <div className='list-item__details-controls-left'>
                <Link href={`/details/${item?._id}`}>
                  <span className='list-item__edit-button list-item__edit-button--desktop'>
                    <MdEdit />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className={`list-item__controls${
          item?.dateAndTime || item?.date
            ? ' list-item__controls--upcoming'
            : ''
        }`}
      >
        {width <= 600 && (
          <ItemButtons
            date={item?.date}
            dateAndTime={item?.dateAndTime}
            description={item?.description}
            confirmDeletion={item?.confirmDeletion}
            handleShowDetails={handleShowDetails}
            isOpen={isOpen}
            taskToEditId={taskToEditId}
            handleEditTask={handleEditTask}
            itemId={item?._id}
            isAwaitingEditResponse={isAwaitingEditResponse}
            handleCancelEdit={handleCancelEdit}
            handleDeleteTask={handleDeleteTask}
            setIsOpen={setIsOpen}
            isAwaitingDeleteResponse={isAwaitingDeleteResponse}
          />
        )}
      </div>
    </div>
  );
};
export default ItemList;
