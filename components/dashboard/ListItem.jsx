'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '../../context';
import { useInnerWidth, useIsMounted } from '../../hooks';
import { ItemButtons } from '../../components';
import {
  handleTodaysDateCheck,
  handleTransitionSpeed,
  handleHiddenHeight,
  handleItemPastDueCheck,
  handleCloseOpenItem,
} from '../../utilities';
import moment from 'moment-timezone';
import DOMPurify from 'isomorphic-dompurify';
import { GrDrag, GrMore } from 'react-icons/gr';
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
  ITEM_TYPE_REMINDER,
} from '../../constants';

const Tooltip = dynamic(() => import('../shared/Tooltip'));
const TooltipReminderMessage = dynamic(
  () => import('../settings/TooltipReminderMessage'),
);

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
  const {
    listItemsMobileReset,
    setListItemsMobileReset,
    closeListItemsYAxis,
    setCloseListItemsYAxis,
  } = useAppContext();
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
  const itemOrderRef = useRef(null);
  const itemHeightsRef = useRef(null);
  const currentTranslateXRef = useRef(null);
  const currentTranslateYRef = useRef(null);
  const mobileUpdateOrDetailsButtonRef = useRef(null);
  const mobileDeleteButtonRef = useRef(null);

  const [itemDetailsHeight, setItemDetailsHeight] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [startXPosition, setStartXPosition] = useState(0);
  const [startYPosition, setStartYPosition] = useState(0);
  const [itemXPositionOnStart, setItemXPositionOnStart] = useState(0);
  const [itemXPositionOnEnd, setItemXPositionOnEnd] = useState(0);
  const [previousTranslateX, setPreviousTranslateX] = useState(0);
  const [movedBy, setMovedBy] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [listItemYPositionOnStart, setListItemYPositionOnStart] = useState(0);

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
      currentTranslateXRef.current = 0;
      setPreviousTranslateX(0);
      setListItemsMobileReset(false);
    }
  }, [listItemsMobileReset]);

  // reset list item y axis open and close functionality after useCloseListItemsYAxis hook is used
  useEffect(() => {
    if (!closeListItemsYAxis) return;
    setIsOpen(false);
    detailsRef.current.style.transition = 'height 0.3s';
    setCloseListItemsYAxis(false);
  }, [closeListItemsYAxis]);

  // disable scrolling when interacting with items on touch
  useEffect(() => {
    const handlePreventScroll = (e) => {
      if (
        (e.cancelable && isDraggingYRef.current) ||
        (e.cancelable && isSwipingXRef.current)
      ) {
        e.preventDefault();
      }
    };

    listItemInnerRef.current.addEventListener(
      'touchmove',
      (e) => handlePreventScroll(e),
      { passive: false },
    );

    return () => {
      listItemInnerRef.current?.removeEventListener(
        'touchmove',
        (e) => handlePreventScroll(e),
        { passive: false },
      );
    };
  }, []);

  // set item details height for when item is open
  useEffect(() => {
    if (!item?.description) return;
    setItemDetailsHeight(handleHiddenHeight(detailsRef.current));
  }, [item]);

  // handle touch x-axis transitions after touchend event
  useEffect(() => {
    if (currentTranslateXRef.current === previousTranslateX) return;

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
      mobileUpdateOrDetailsButtonRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      mobileUpdateOrDetailsButtonRef.current.style.transform = `translateX(-146px)`;
      mobileDeleteButtonRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      mobileDeleteButtonRef.current.style.transform = `translateX(-73px)`;
      currentTranslateXRef.current = MAX_MOVE_DISTANCE;
      setPreviousTranslateX(MAX_MOVE_DISTANCE);
      previousItemId = handleCloseOpenItem(listItemInnerRef.current.id);
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
      mobileUpdateOrDetailsButtonRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      mobileUpdateOrDetailsButtonRef.current.style.transform = `translateX(0)`;
      mobileDeleteButtonRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      mobileDeleteButtonRef.current.style.transform = `translateX(0)`;
      currentTranslateXRef.current = 0;
      setPreviousTranslateX(0);
      if (isOpen) setIsOpen(false);
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
      mobileUpdateOrDetailsButtonRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      mobileUpdateOrDetailsButtonRef.current.style.transform = `translateX(0)`;
      mobileDeleteButtonRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      mobileDeleteButtonRef.current.style.transform = `translateX(0)`;
      currentTranslateXRef.current = 0;
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
      mobileUpdateOrDetailsButtonRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      mobileUpdateOrDetailsButtonRef.current.style.transform = `translateX(-146px)`;
      mobileDeleteButtonRef.current.style.transition = `transform ${transitionSpeed}ms ease-out`;
      mobileDeleteButtonRef.current.style.transform = `translateX(-73px)`;
      currentTranslateXRef.current = MAX_MOVE_DISTANCE;
      setPreviousTranslateX(MAX_MOVE_DISTANCE);
    }
  }, [duration, movedBy]);

  // touch x-axis start
  const handleSwipeXStart = (e) => {
    // after item closes when new item is opened state must be reset on previously opened item
    if (listItemInnerRef.current.id !== previousItemId) {
      currentTranslateXRef.current = 0;
      setPreviousTranslateX(0);
      setIsOpen(false);
    }
    setStartXPosition(e.touches[0].clientX);
    setStartYPosition(e.touches[0].clientY);
    listItemInnerRef.current.style.transition = 'none';
    mobileUpdateOrDetailsButtonRef.current.style.transition = 'none';
    mobileDeleteButtonRef.current.style.transition = 'none';
    setItemXPositionOnStart(
      listItemInnerRef.current.getBoundingClientRect().left,
    );
    setStartTime(new Date().getTime());
  };

  // touch x-axis move
  const handleSwipeXMove = (e) => {
    // if touch move is up or down end touch move
    if (
      Math.max(
        e.touches[0].clientY - startYPosition,
        startYPosition - e.touches[0].clientY,
      ) >
      Math.max(
        e.touches[0].clientX - startXPosition,
        startXPosition - e.touches[0].clientX,
      )
    )
      return;

    isSwipingXRef.current = true;

    let currentPosition = e.touches[0].clientX;
    currentTranslateXRef.current = Math.max(
      MAX_MOVE_DISTANCE,
      Math.min(previousTranslateX + currentPosition - startXPosition, 0),
    );

    animationXIdRef.current = requestAnimationFrame(animationX);
  };

  // animate x-axis
  const animationX = () => {
    listItemInnerRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;

    if (currentTranslateXRef.current >= -146) {
      mobileUpdateOrDetailsButtonRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
    }

    if (currentTranslateXRef.current >= -146) {
      mobileDeleteButtonRef.current.style.transform = `translateX(${
        currentTranslateXRef.current / 2
      }px)`;
    }

    cancelAnimationFrame(animationXIdRef.current);
  };

  // touch x-axis end
  const handleSwipeXEnd = () => {
    isSwipingXRef.current = false;
    setMovedBy(Math.abs(currentTranslateXRef.current - previousTranslateX));
    setDuration(new Date().getTime() - startTime);
    setItemXPositionOnEnd(
      listItemInnerRef.current.getBoundingClientRect().left,
    );
  };

  // y-axis start
  const handleDragYStart = (e) => {
    isDraggingYRef.current = true;
    handleDragStart(index);
    setStartYPosition(
      e.type.includes('mouse') ? e.pageY : e.touches[0].clientY,
    );
    startingIndexRef.current = index;

    // measure every item up front - the first absolute item drops the rest out of flow
    const listItems = arrayOfListItemsRef.current ?? [];
    const heights = new Map(listItems.map((item) => [item, item.offsetHeight]));

    let listItemWrapperHeight = 0;
    const tops = listItems.map((item) => {
      const top = listItemWrapperHeight;
      listItemWrapperHeight += heights.get(item);
      return top;
    });

    itemOrderRef.current = [...listItems];
    itemHeightsRef.current = heights;
    setListItemYPositionOnStart(tops[index]);

    listItemWrapperRef.current.setAttribute(
      'style',
      `height: ${listItemWrapperHeight}px`,
    );

    listItems.forEach((item, i) => {
      item.style.position = 'absolute';
      item.style.top = `${tops[i]}px`;
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

    const order = itemOrderRef.current;
    const heights = itemHeightsRef.current;
    if (!order || !heights) return;

    const draggedItem = listItemRef.current;
    const draggedHeight = heights.get(draggedItem);
    const totalHeight = order.reduce((sum, item) => sum + heights.get(item), 0);

    let currentPosition = e.type.includes('mouse')
      ? e.pageY
      : e.touches[0].clientY;

    currentTranslateYRef.current = Math.max(
      0,
      Math.min(
        listItemYPositionOnStart + currentPosition - startYPosition,
        totalHeight - draggedHeight,
      ),
    );

    animationYIdRef.current = requestAnimationFrame(animationY);

    const topOf = (position) => {
      let top = 0;
      for (let i = 0; i < position; i++) top += heights.get(order[i]);
      return top;
    };

    const draggedTop = currentTranslateYRef.current;
    let newIndex = order.indexOf(draggedItem);
    let moved = false;

    // step past a neighbour as soon as the dragged edge clears that neighbour's midpoint
    while (newIndex > 0) {
      const previous = order[newIndex - 1];
      if (draggedTop >= topOf(newIndex - 1) + heights.get(previous) / 2) break;
      order.splice(newIndex, 1);
      order.splice(newIndex - 1, 0, draggedItem);
      newIndex -= 1;
      moved = true;
    }

    while (newIndex < order.length - 1) {
      const next = order[newIndex + 1];
      if (
        draggedTop + draggedHeight <=
        topOf(newIndex + 1) + heights.get(next) / 2
      )
        break;
      order.splice(newIndex, 1);
      order.splice(newIndex + 1, 0, draggedItem);
      newIndex += 1;
      moved = true;
    }

    if (!moved) return;

    startingIndexRef.current = newIndex;
    handleDragEnter(newIndex);

    // relayout everything except the item tracking the pointer
    let top = 0;
    order.forEach((item, i) => {
      if (item !== draggedItem) item.style.top = `${top}px`;
      item.setAttribute('data-list-item-index', i);
      top += heights.get(item);
    });
  };

  // animate y-axis
  const animationY = () => {
    listItemRef.current.style.top = `${currentTranslateYRef.current}px`;
    cancelAnimationFrame(animationYIdRef.current);
  };

  // y-axis end
  const handleDragYEnd = (e) => {
    isDraggingYRef.current = false;

    handleDragEnd();

    listItemWrapperRef.current.removeAttribute('style');

    arrayOfListItemsRef.current?.forEach((item, i) => {
      item.style.position = 'relative';
      item.style.top = 'unset';
      item.style.left = 'unset';
      item.style.right = 'unset';
      item.style.zIndex = '1';
      item.setAttribute('data-list-item-index', parseInt(i));
    });

    itemOrderRef.current = null;
    itemHeightsRef.current = null;

    if (e.type.includes('mouse')) e.target.style.cursor = 'grab';
  };

  const isToday = item?.date ? handleTodaysDateCheck(item?.date) : false;
  const isPastDue = item?.date ? handleItemPastDueCheck(item?.date) : false;

  return (
    <div
      className='list-item__outer-wrapper'
      id={`list-item_${item?._id}`}
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
          id={`list-item-inner_${item?._id}`}
        >
          {(itemType === ITEM_TYPE_DASHBOARD ||
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
              onMouseUp={(e) => {
                isDraggingYRef.current && handleDragYEnd(e);
              }}
              onMouseLeave={(e) => {
                isDraggingYRef.current && handleDragYEnd(e);
              }}
            >
              <GrDrag />
            </div>
          )}
          {itemType === ITEM_TYPE_NOTE && (
            <div className='list-item__item-pin-zone'>
              <button
                onClick={() => {
                  handlePinNote(
                    item?._id,
                    item?.userId,
                    !item?.pinned,
                    item?.date,
                  );
                }}
                type='button'
                className='list-item__pin-button'
              >
                <MdPushPin />
              </button>
            </div>
          )}
          {itemType === ITEM_TYPE_REMINDER && (
            <div className='list-item__item-tooltip-zone'>
              <Tooltip icon={<GrMore />}>
                <TooltipReminderMessage
                  reminderDate={item?.reminderDate}
                  recurrenceInterval={item?.recurrenceInterval}
                  exactRecurringDate={item?.exactRecurringDate}
                  recurrenceBuffer={item?.recurrenceBuffer}
                />
              </Tooltip>
            </div>
          )}
          <div
            className='list-item__item-swipe-zone'
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
                setIsOpen={setIsOpen}
                isOpen={isOpen}
                itemToUpdateId={itemToUpdateId}
                getItemToUpdate={getItemToUpdate}
                itemId={item?._id}
                isAwaitingEditResponse={isAwaitingEditResponse}
                handleDeleteItem={handleDeleteItem}
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
                  height: `${itemDetailsHeight}px`,
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
              {/*   )} */}
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
            setIsOpen={setIsOpen}
            isOpen={isOpen}
            itemToUpdateId={itemToUpdateId}
            getItemToUpdate={getItemToUpdate}
            itemId={item?._id}
            isAwaitingEditResponse={isAwaitingEditResponse}
            handleDeleteItem={handleDeleteItem}
            isAwaitingDeleteResponse={isAwaitingDeleteResponse}
            mobileUpdateOrDetailsButtonRef={mobileUpdateOrDetailsButtonRef}
            mobileDeleteButtonRef={mobileDeleteButtonRef}
          />
        )}
      </div>
    </div>
  );
};
export default ItemList;
