'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppContext } from '../../context';
import { useInnerWidth, useIsMounted } from '../../hooks';
import ItemButtons from './ItemButtons';
import {
  handleTodaysDateCheck,
  handleTransitionSpeed,
  handleHiddenHeight,
  handleItemPastDueCheck,
  handleCloseOpenItem,
} from '../../utilities';
import moment from 'moment-timezone';
import DOMPurify from 'isomorphic-dompurify';
import { GrDrag } from 'react-icons/gr';
import { MdEdit, MdPushPin } from 'react-icons/md';
import { TbChevronRight } from 'react-icons/tb';
import {
  OPEN_CLOSE_THRESHOLD,
  TOUCH_DURATION_THRESHOLD,
  MAX_MOVE_DISTANCE,
  MOBILE_BREAKPOINT,
  ITEM_TYPE_NOTE,
  ITEM_TYPE_DASHBOARD,
  ITEM_TYPE_CATEGORY,
} from '../../constants';

let previousItemId = '';

const ItemList = ({
  item,
  getItemToUpdate,
  handleDeleteItem,
  isAwaitingEditResponse,
  isAwaitingDeleteResponse,
  itemToUpdateId,
  index,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
  listItemWrapperRef,
  numberOfItemsInColumn,
  itemType,
  timezone,
  handlePinNote,
}) => {
  const { listItemsMobileReset, setListItemsMobileReset } = useAppContext();

  const width = useInnerWidth();
  const isMounted = useIsMounted();

  const listItemRef = useRef(null);
  const listItemInnerRef = useRef(null);
  const detailsRef = useRef(null);
  const startingIndexRef = useRef(null);
  const isSwipingXRef = useRef(null);
  const isDraggingYRef = useRef(null);
  const animationXIdRef = useRef(null);
  const animationYIdRef = useRef(null);
  const arrayOfListItemsRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [startXPosition, setStartXPosition] = useState(0);
  const [startYPosition, setStartYPosition] = useState(0);
  const [itemXPositionOnStart, setItemXPositionOnStart] = useState(0);
  const [itemXPositionOnEnd, setItemXPositionOnEnd] = useState(0);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [previousTranslateX, setPreviousTranslateX] = useState(0);
  const [movedBy, setMovedBy] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [listItemYPositionOnStart, setListItemYPositionOnStart] = useState(0);
  const [listItemId, setListItemId] = useState('');

  // get array of column list items for touch y-axis dom manipulation
  useEffect(() => {
    if (!listItemWrapperRef) return;
    const listItemWrapper = listItemWrapperRef.current;
    arrayOfListItemsRef.current = [
      ...listItemWrapper.querySelectorAll('.list-item__outer-wrapper'),
    ];
  }, [numberOfItemsInColumn]);

  // when all items are closed automatically make sure state is reset for next item touch
  useEffect(() => {
    if (listItemsMobileReset) {
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
      setListItemsMobileReset(false);
    }
  }, [listItemsMobileReset]);

  // disable scrolling when opening and closing items on touch
  useEffect(() => {
    const handlePreventScroll = (e) => {
      if (listItemInnerRef.current.style.transform !== 'translateX(0px)') {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    listItemInnerRef.current.addEventListener(
      'touchmove',
      (e) => handlePreventScroll(e),
      { passive: false }
    );

    return () => {
      listItemInnerRef.current?.removeEventListener(
        'touchmove',
        (e) => handlePreventScroll(e),
        { passive: false }
      );
    };
  }, []);

  // handle touch x-axis transitions after touchend event
  useEffect(() => {
    if (currentTranslateX === previousTranslateX) return;

    // open item on swipe or when touchmove exceeds open threshold
    if (
      (duration < TOUCH_DURATION_THRESHOLD &&
        itemXPositionOnEnd < itemXPositionOnStart) ||
      (duration >= TOUCH_DURATION_THRESHOLD &&
        movedBy >= OPEN_CLOSE_THRESHOLD &&
        itemXPositionOnEnd < itemXPositionOnStart)
    ) {
      const transitionSpeed = handleTransitionSpeed(movedBy, duration);
      listItemInnerRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      listItemInnerRef.current.style.transform = `translateX(-146px)`;
      setCurrentTranslateX(MAX_MOVE_DISTANCE);
      setPreviousTranslateX(MAX_MOVE_DISTANCE);
    }

    // close item on swipe or when touchmove exceeds close threshold
    if (
      (duration < TOUCH_DURATION_THRESHOLD &&
        itemXPositionOnEnd > itemXPositionOnStart) ||
      (duration >= TOUCH_DURATION_THRESHOLD &&
        movedBy > OPEN_CLOSE_THRESHOLD &&
        itemXPositionOnEnd > itemXPositionOnStart)
    ) {
      const transitionSpeed = handleTransitionSpeed(movedBy, duration);
      listItemInnerRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      listItemInnerRef.current.style.transform = 'translateX(0px)';
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
    }

    // when closed, return item to close state when touchmove does not exceed open threshold
    if (
      duration >= TOUCH_DURATION_THRESHOLD &&
      movedBy < OPEN_CLOSE_THRESHOLD &&
      itemXPositionOnStart === 0
    ) {
      const transitionSpeed = handleTransitionSpeed(movedBy, duration);
      listItemInnerRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      listItemInnerRef.current.style.transform = 'translateX(0px)';
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
    }

    // when open, return item to open state when touchmove does not exceed close threshold
    if (
      duration >= TOUCH_DURATION_THRESHOLD &&
      movedBy < OPEN_CLOSE_THRESHOLD &&
      itemXPositionOnStart === MAX_MOVE_DISTANCE
    ) {
      const transitionSpeed = handleTransitionSpeed(movedBy, duration);
      listItemInnerRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      listItemInnerRef.current.style.transform = 'translateX(-146px)';
      setCurrentTranslateX(MAX_MOVE_DISTANCE);
      setPreviousTranslateX(MAX_MOVE_DISTANCE);
    }
  }, [duration, movedBy]);

  // initialize and run animations
  useEffect(() => {
    animationXIdRef.current = requestAnimationFrame(animationX);
    animationYIdRef.current = requestAnimationFrame(animationY);

    return () => {
      cancelAnimationFrame(animationXIdRef.current);
      cancelAnimationFrame(animationYIdRef.current);
    };
  }, [currentTranslateX, currentTranslateY]);

  // touch x-axis start
  const handleSwipeXStart = (e) => {
    isSwipingXRef.current = true;
    // after item closes when new item is opened state must be reset on previously opened item
    if (listItemInnerRef.current.id !== previousItemId) {
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
    }
    previousItemId = handleCloseOpenItem(listItemInnerRef.current.id);
    setStartXPosition(e.touches[0].clientX);
    setStartYPosition(e.touches[0].clientY);
    listItemInnerRef.current.style.transition = 'none';
    setItemXPositionOnStart(
      listItemInnerRef.current.getBoundingClientRect().left
    );
    setStartTime(new Date().getTime());
  };

  // touch x-axis move
  const handleSwipeXMove = (e) => {
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
    setCurrentTranslateX(
      Math.max(
        MAX_MOVE_DISTANCE,
        Math.min(previousTranslateX + currentPosition - startXPosition, 0)
      )
    );
  };

  // touch x-axis end
  const handleSwipeXEnd = () => {
    isSwipingXRef.current = false;
    setMovedBy(Math.abs(currentTranslateX - previousTranslateX));
    setDuration(new Date().getTime() - startTime);
    setItemXPositionOnEnd(
      listItemInnerRef.current.getBoundingClientRect().left
    );
    cancelAnimationFrame(animationXIdRef.current);
  };

  // animate x-axis
  const animationX = () => {
    if (isSwipingXRef.current) {
      listItemInnerRef.current.style.transform = `translateX(${currentTranslateX}px)`;
      requestAnimationFrame(animationX);
    }
  };

  // disable scrolling on y-axis move
  useEffect(() => {
    const handlePreventScroll = (e) => {
      if (isDraggingYRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    listItemInnerRef.current.addEventListener(
      'touchmove',
      (e) => handlePreventScroll(e),
      { passive: false }
    );

    return () => {
      listItemInnerRef.current?.removeEventListener(
        'touchmove',
        (e) => handlePreventScroll(e),
        { passive: false }
      );
    };
  }, [isDraggingYRef.current]);

  // y-axis start
  const handleDragYStart = (e) => {
    isDraggingYRef.current = true;
    handleDragStart(index);
    setStartYPosition(
      e.type.includes('mouse') ? e.pageY : e.touches[0].clientY
    );
    setListItemYPositionOnStart(listItemRef.current.clientHeight * index);
    setListItemId(listItemRef.current.id);
    startingIndexRef.current = index;

    // set height of list item wrapper
    const handleWrapperHeight = (numberOfItems) => {
      return numberOfItems * listItemRef.current.clientHeight;
    };

    listItemWrapperRef.current.setAttribute(
      'style',
      `height: ${handleWrapperHeight(numberOfItemsInColumn)}px`
    );

    // make each item absolutely positioned
    arrayOfListItemsRef.current?.forEach((item, i) => {
      item.style.position = 'absolute';
      item.style.top = `${item.clientHeight * i}px`;
      item.style.left = '0';
      item.style.right = '0';
      item.style.zIndex = '1';
    });

    listItemRef.current.style.zIndex = '2';

    if (e.type.includes('mouse')) e.target.style.cursor = 'grabbing';
  };

  // y-axis move
  const handleDragYMove = (e) => {
    if (isOpen) return;

    let currentPosition = e.type.includes('mouse')
      ? e.pageY
      : e.touches[0].clientY;

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

    // move up and trigger array resort and dom update
    if (
      currentTranslateY > 0 &&
      currentTranslateY <
        listItemRef.current.clientHeight * (startingIndexRef.current - 1) +
          listItemRef.current.clientHeight / 2
    ) {
      startingIndexRef.current -= 1;
      handleDragEnter(startingIndexRef.current);

      arrayOfListItemsRef.current?.forEach((item) => {
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
        if (listItemId === item.id) {
          item.setAttribute(
            'data-list-item-index',
            parseInt(item.dataset.listItemIndex) - 1
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
      handleDragEnter(startingIndexRef.current);

      arrayOfListItemsRef.current?.forEach((item) => {
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
        if (listItemId === item.id) {
          item.setAttribute(
            'data-list-item-index',
            parseInt(item.dataset.listItemIndex) + 1
          );
        }
      });
    }
  };

  // y-axis end
  const handleDragYEnd = (e) => {
    if (!isDraggingYRef.current) return;

    isDraggingYRef.current = false;
    listItemWrapperRef.current.removeAttribute('style');
    handleDragEnd();

    arrayOfListItemsRef.current?.forEach((item, i) => {
      item.style.position = 'relative';
      item.style.top = 'unset';
      item.style.left = 'unset';
      item.style.right = 'unset';
      item.style.zIndex = '1';
      item.setAttribute('data-list-item-index', parseInt(i));
    });

    cancelAnimationFrame(animationYIdRef.current);

    if (e.type.includes('mouse')) e.target.style.cursor = 'grab';
  };

  // animate y-axis
  const animationY = () => {
    if (isDraggingYRef.current) {
      listItemRef.current.style.top = `${currentTranslateY}px`;
      requestAnimationFrame(animationY);
    }
  };

  const handleShowDetails = () => {
    setIsOpen((prevState) => !prevState);
  };

  const isToday = item?.mandatoryDate
    ? handleTodaysDateCheck(item?.date)
    : false;

  const isPastDue = item?.mandatoryDate
    ? handleItemPastDueCheck(item?.date)
    : false;

  return (
    <div
      className='list-item__outer-wrapper'
      id={`list-item_${index}`}
      ref={listItemRef}
      data-list-item-index={index}
    >
      <div
        className={`list-item__inner-wrapper${
          (item?.dateAndTime || item?.date) && itemType === ITEM_TYPE_DASHBOARD
            ? ' list-item__inner-wrapper--upcoming'
            : ''
        }`}
      >
        {(item?.dateAndTime || item?.date) &&
          itemType === ITEM_TYPE_DASHBOARD && (
            <div
              className={`list-item__upcoming-date-time${
                isToday
                  ? ' list-item__upcoming-date-time--is-today'
                  : isPastDue
                  ? ' list-item__upcoming-date-time--pastDue'
                  : ''
              }`}
            >
              {item?.dateAndTime ? (
                <p>
                  {isToday && 'Today, '}
                  {isPastDue && 'Past Due! '}
                  {moment(item?.dateAndTime)
                    .tz(timezone)
                    .format('dddd, MMMM D,')}{' '}
                  {moment(item?.dateAndTime).tz(timezone).format('h:mm A')}{' '}
                </p>
              ) : (
                <p>
                  {isToday && 'Today, '}
                  {isPastDue && 'Past Due! '}
                  {moment(item?.date).format('dddd, MMMM D')}
                </p>
              )}
            </div>
          )}
        <div
          ref={listItemInnerRef}
          className='list-item__item'
          id={`list-item-inner_${index}`}
        >
          {((!item?.mandatoryDate && itemType === ITEM_TYPE_DASHBOARD) ||
            itemType === ITEM_TYPE_CATEGORY) && (
            <div
              className='list-item__item-drag-zone'
              onTouchStart={handleDragYStart}
              onTouchMove={handleDragYMove}
              onTouchEnd={handleDragYEnd}
              onMouseDown={handleDragYStart}
              onMouseMove={(e) => {
                isDraggingYRef.current && handleDragYMove(e);
              }}
              onMouseUp={handleDragYEnd}
              onMouseLeave={handleDragYEnd}
            >
              <GrDrag />
            </div>
          )}
          {!item?.mandatoryDate && itemType === ITEM_TYPE_NOTE && (
            <div
              className='list-item__item-pin-zone'
              style={{ opacity: item?.pinned ? '0.9' : '0.5' }}
            >
              <button
                onClick={() => {
                  handlePinNote(
                    item?._id,
                    item?.userId,
                    !item?.pinned,
                    item?.date
                  );
                }}
                type='button'
                className='list-item__pin-button'
              >
                <MdPushPin />
              </button>
            </div>
          )}
          <div
            className={`list-item__item-swipe-zone ${
              item?.mandatoryDate && itemType === ITEM_TYPE_DASHBOARD
                ? 'list-item__item-swipe-zone--upcoming'
                : ''
            }`}
            onTouchStart={handleSwipeXStart}
            onTouchMove={handleSwipeXMove}
            onTouchEnd={handleSwipeXEnd}
          >
            <p>{item?.title}</p>
            {isMounted && width <= MOBILE_BREAKPOINT && <TbChevronRight />}
          </div>
          <div className='list-item__item-right'>
            {isMounted && width > MOBILE_BREAKPOINT && (
              <ItemButtons
                date={item?.date}
                dateAndTime={item?.dateAndTime}
                description={item?.description}
                confirmDeletion={item?.confirmDeletion}
                handleShowDetails={handleShowDetails}
                isOpen={isOpen}
                itemToUpdateId={itemToUpdateId}
                getItemToUpdate={getItemToUpdate}
                itemId={item?._id}
                isAwaitingEditResponse={isAwaitingEditResponse}
                handleDeleteItem={handleDeleteItem}
                setIsOpen={setIsOpen}
                isAwaitingDeleteResponse={isAwaitingDeleteResponse}
              />
            )}
          </div>
        </div>
        <div
          ref={detailsRef}
          className='list-item__details'
          style={
            isOpen
              ? {
                  height: `${handleHiddenHeight(detailsRef.current)}px`,
                }
              : { height: '0px' }
          }
        >
          <div className='list-item__details-padding'>
            {itemType === ITEM_TYPE_NOTE && (
              <p className='list-item__notes-posted-date'>
                {moment(item?.date).format('dddd, MMMM D, YYYY')}
              </p>
            )}
            {item?.description && (
              <div
                className='list-item__details-quill-wrapper'
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(item?.description) ?? '',
                }}
              />
            )}
            <div className='list-item__details-controls-left'>
              {itemType !== ITEM_TYPE_NOTE && (
                <Link
                  href={`/details/${item?._id}`}
                  className='list-item__edit-button list-item__edit-button--desktop'
                >
                  <MdEdit />
                </Link>
              )}
              {itemType === ITEM_TYPE_NOTE && (
                <button
                  onClick={() => {
                    getItemToUpdate(item?._id);
                  }}
                  type='button'
                  className='list-item__edit-button list-item__edit-button--desktop'
                >
                  {isAwaitingEditResponse && itemToUpdateId === item?._id ? (
                    <div className='loader'></div>
                  ) : (
                    <MdEdit />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`list-item__controls${
          itemType === ITEM_TYPE_DASHBOARD && (item?.dateAndTime || item?.date)
            ? ' list-item__controls--upcoming'
            : ''
        }`}
      >
        {isMounted && width <= MOBILE_BREAKPOINT && (
          <ItemButtons
            date={item?.date}
            dateAndTime={item?.dateAndTime}
            description={item?.description}
            confirmDeletion={item?.confirmDeletion}
            handleShowDetails={handleShowDetails}
            isOpen={isOpen}
            itemToUpdateId={itemToUpdateId}
            getItemToUpdate={getItemToUpdate}
            itemId={item?._id}
            isAwaitingEditResponse={isAwaitingEditResponse}
            handleDeleteItem={handleDeleteItem}
            setIsOpen={setIsOpen}
            isAwaitingDeleteResponse={isAwaitingDeleteResponse}
          />
        )}
      </div>
    </div>
  );
};
export default ItemList;
