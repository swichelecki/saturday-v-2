import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ItemButtons from './ItemButtons';
import { useInnerWidth } from '../hooks';
import { handleTodaysDateCheck } from 'utilities';
import moment from 'moment-timezone';
import { GrDrag } from 'react-icons/gr';
import { MdEdit } from 'react-icons/md';
import { TbChevronRight } from 'react-icons/tb';

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
}) => {
  const width = useInnerWidth();

  const detailsRef = useRef(null);
  const itemRef = useRef(null);
  const animationIdRef = useRef(null);
  const detailsRefCurrent = detailsRef.current;

  const [isOpen, setIsOpen] = useState(false);
  const [startXPosition, setStartXPosition] = useState(0);
  const [startYPosition, setStartYPosition] = useState(0);
  const [itemPositionOnStart, setItemPositionOnStart] = useState(0);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [previousTranslateX, setPreviousTranslateX] = useState(0);
  const [movedBy, setMovedBy] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const OPEN_CLOSE_THRESHOLD = 50;
  const TOUCH_DURATION_THRESHOLD = 500;

  useEffect(() => {
    if (allItemsTouchReset) {
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
      setAllItemsTouchReset(false);
    }
  }, [allItemsTouchReset]);

  // handle touch transitions after touchend event
  useEffect(() => {
    itemRef.current.style.transition = 'transform 150ms';
    if (currentTranslateX === previousTranslateX) return;

    // return item to close state when touchmove does not exceed open threshold
    if (
      duration >= TOUCH_DURATION_THRESHOLD &&
      movedBy * -1 < OPEN_CLOSE_THRESHOLD &&
      itemPositionOnStart === 0
    ) {
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
      itemRef.current.style.transform = 'translateX(0px)';
    }

    // open item on swipe or when touchmove exceeds open threshold
    if (
      (duration < TOUCH_DURATION_THRESHOLD && itemPositionOnStart === 0) ||
      (duration >= TOUCH_DURATION_THRESHOLD &&
        movedBy * -1 >= OPEN_CLOSE_THRESHOLD &&
        itemPositionOnStart === 0)
    ) {
      setCurrentTranslateX(-146);
      setPreviousTranslateX(-146);
      itemRef.current.style.transform = 'translateX(-146px)';
    }

    // return item to open state when touchmove does not exceed close threshold
    if (
      duration >= TOUCH_DURATION_THRESHOLD &&
      movedBy * -1 < OPEN_CLOSE_THRESHOLD &&
      itemPositionOnStart === -146
    ) {
      setCurrentTranslateX(-146);
      setPreviousTranslateX(-146);
      itemRef.current.style.transform = 'translateX(-146px)';
    }

    // close item on swipe or when touchmove exceeds close threshold
    if (
      (duration < TOUCH_DURATION_THRESHOLD && itemPositionOnStart === -146) ||
      (duration >= TOUCH_DURATION_THRESHOLD &&
        movedBy > OPEN_CLOSE_THRESHOLD &&
        itemPositionOnStart === -146)
    ) {
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
      itemRef.current.style.transform = 'translateX(0px)';
    }

    cancelAnimationFrame(animationIdRef.current);
  }, [duration]);

  // disable scrolling when opening and closing items on touch
  useEffect(() => {
    itemRef.current.addEventListener(
      'touchmove',
      (e) => {
        if (itemRef.current.style.transform !== 'translateX(0px)') {
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      },
      { passive: false }
    );

    return () => {
      if (itemRef.current) {
        itemRef.current.removeEventListener('touchmove', () => {});
      }
    };
  });

  // touch start
  const handleTouchStart = (e) => {
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
    // touch scroll down and prevent items from opening
    if (
      e.touches[0].clientY - startYPosition >
        startXPosition - e.touches[0].clientX &&
      itemPositionOnStart === 0
    ) {
      return;
    }

    // touch scroll up and prevent items from opening
    if (
      startYPosition - e.touches[0].clientY >
        startXPosition - e.touches[0].clientX &&
      itemPositionOnStart === 0
    ) {
      return;
    }

    if (isOpen) return;
    let currentPosition = e.touches[0].clientX;
    setCurrentTranslateX(previousTranslateX + currentPosition - startXPosition);
    setMovedBy(currentTranslateX - previousTranslateX);
    animationIdRef.current = requestAnimationFrame(animation);
  };

  // touch end
  const handleTouchEnd = () => {
    setDuration(new Date().getTime() - startTime);
  };

  // animate open and close item on touchmove
  const animation = () => {
    const itemTranslateX = Math.max(-146, Math.min(currentTranslateX, 0));
    itemRef.current.style.transform = `translateX(${itemTranslateX}px)`;
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
        dragging ? handleDragStyles(index) : 'list-item__outer-wrapper'
      }
      style={item?.type === 'upcoming' ? { cursor: 'default' } : {}}
      draggable={item?.type !== 'upcoming'}
      onDragStart={() => {
        handleDragStart(index);
        setHideItemDetailsOnDrag(true);
      }}
      onDragEnter={
        dragging
          ? () => {
              handleDragEnter(index);
            }
          : null
      }
      onDragEnd={handleDragEnd}
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
            <div className='list-item__item-drag-zone'>
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
