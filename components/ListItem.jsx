import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ItemButtons from './ItemButtons';
import { useInnerWidth } from '../hooks';
import moment from 'moment-timezone';
import { GrDrag } from 'react-icons/gr';
import { BiChevronRight } from 'react-icons/bi';

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
}) => {
  const width = useInnerWidth();

  const detailsRef = useRef(null);
  const itemRef = useRef(null);
  const animationIdRef = useRef(null);
  const detailsRefCurrent = detailsRef.current;

  const [isOpen, setIsOpen] = useState(false);
  const [startPosition, setStartPosition] = useState(0);
  const [itemPositionOnStart, setItemPositionOnStart] = useState(0);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [previousTranslateX, setPreviousTranslateX] = useState(0);
  const [movedBy, setMovedBy] = useState(0);

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

  useEffect(() => {
    itemRef.current.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        setStartPosition(e.touches[0].clientX);
        itemRef.current.style.transition = 'none';
        setItemPositionOnStart(itemRef.current.getBoundingClientRect().left);
      },
      { passive: false }
    );
  }, []);

  const handleTouchMove = (e) => {
    let currentPosition = e.touches[0].clientX;
    setCurrentTranslateX(previousTranslateX + currentPosition - startPosition);
    setMovedBy(currentTranslateX - previousTranslateX);
    animationIdRef.current = requestAnimationFrame(animation);
  };

  const handleTouchEnd = () => {
    itemRef.current.style.transition = 'transform 150ms';

    if (movedBy * -1 <= 40 && itemPositionOnStart === 0) {
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
      itemRef.current.style.transform = `translateX(0)`;
    }

    if (movedBy * -1 > 40 && itemPositionOnStart === 0) {
      setCurrentTranslateX(-146);
      setPreviousTranslateX(-146);
      itemRef.current.style.transform = `translateX(-146px)`;
    }

    if (movedBy <= 40 && itemPositionOnStart === -146) {
      setCurrentTranslateX(-146);
      setPreviousTranslateX(-146);
      itemRef.current.style.transform = `translateX(-146px)`;
    }

    if (movedBy > 40 && itemPositionOnStart === -146) {
      setCurrentTranslateX(0);
      setPreviousTranslateX(0);
      itemRef.current.style.transform = `translateX(0)`;
    }

    setMovedBy(0);
    cancelAnimationFrame(animationIdRef.current);
  };

  const animation = () => {
    const itemTranslateX = Math.max(-146, Math.min(currentTranslateX, 0));
    itemRef.current.style.transform = `translateX(${itemTranslateX}px)`;
  };

  return (
    <div
      className={
        dragging ? handleDragStyles(index) : 'list-item__outer-wrapper'
      }
      style={item?.type === 'upcoming' ? { cursor: 'default' } : {}}
      draggable={item?.type !== 'upcoming' ? true : false}
      onDragStart={() => handleDragStart(index)}
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
          <div className='list-item__upcoming-date-time'>
            {item?.dateAndTime ? (
              <p>
                {moment(item?.dateAndTime)
                  .tz('America/Chicago')
                  .format('dddd, MMMM D,')}{' '}
                {moment(item?.dateAndTime)
                  .tz('America/Chicago')
                  .format('h:mm A')}{' '}
              </p>
            ) : (
              <p>{moment(item?.date).format('dddd, MMMM D')}</p>
            )}
          </div>
        )}
        <div ref={itemRef} className='list-item__item'>
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
            onTouchMove={(e) => handleTouchMove(e)}
            onTouchEnd={handleTouchEnd}
          >
            <p>{item?.title}</p>
          </div>
          <div className='list-item__item-right'>
            {width <= 600 ? (
              <BiChevronRight />
            ) : (
              <ItemButtons
                date={item?.date}
                dateAndTime={item?.dateAndTime}
                description={item?.description}
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
        <div
          ref={detailsRef}
          className='list-item__details'
          style={
            isOpen
              ? {
                  height: `${handleHiddenHeight(detailsRefCurrent)}px`,
                }
              : { height: '0' }
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
                <span className='list-item__details-edit-button'>Edit</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`list-item__controls ${
          item?.dateAndTime || item?.date ? 'list-item__controls--upcoming' : ''
        }`}
      >
        {width <= 600 && (
          <ItemButtons
            date={item?.date}
            dateAndTime={item?.dateAndTime}
            description={item?.description}
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
