import { useState, useRef } from 'react';
import Link from 'next/link';
import moment from 'moment-timezone';
import { GrDrag } from 'react-icons/gr';
import { BsThreeDots } from 'react-icons/bs';

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
  const detailsRef = useRef(null);
  const itemRef = useRef(null);
  const controlsRef = useRef(null);
  const detailsRefCurrent = detailsRef.current;

  const [isOpen, setIsOpen] = useState(false);

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

  const handleSlideItem = () => {
    if (
      !itemRef.current.style.transform ||
      itemRef.current.style.transform === 'translateX(0px)' ||
      isOpen
    ) {
      itemRef.current.style.transform = 'translateX(-146px)';
      controlsRef.current.style.visibility = 'visible';
    } else {
      itemRef.current.style.transform = 'translateX(0px)';
      controlsRef.current.style.visibility = isOpen ? 'visible' : 'hidden';
    }
  };

  /*   let posStart = 0;

  const handleTouchStart = (e) => {
    itemRef.current.addEventListener('touchstart', () => {
      e.preventDefault();
      posStart = e.touches[0].clientX;
      console.log('start start');
      console.log(e.touches[0].clientX);
    });

    itemRef.current.addEventListener('touchmove', () => {
      handleTouchMove();
    });

    itemRef.current.addEventListener('touchend', () => {
      handleTouchEnd();
    });
  };

  const handleTouchMove = () => {
    console.log('start move');
  };

  const handleTouchEnd = () => {
    console.log('start end');
  }; */

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
            onMouseEnter={handleSlideItem}
            onMouseLeave={handleSlideItem}
            //onTouchStart={handleTouchStart}
          >
            <p>{item?.title}</p>
          </div>
          <div className='list-item__item-dots'>
            <BsThreeDots />
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
          onMouseEnter={handleSlideItem}
          onMouseLeave={handleSlideItem}
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
        ref={controlsRef}
        className={`list-item__controls ${
          item?.dateAndTime || item?.date ? 'list-item__controls--upcoming' : ''
        }`}
        onMouseEnter={handleSlideItem}
        onMouseLeave={handleSlideItem}
      >
        {item?.date || item?.dateAndTime || item?.description ? (
          <button
            onClick={handleShowDetails}
            className='list-item__details-button'
          >
            Details
          </button>
        ) : taskToEditId !== item?._id || isAwaitingEditResponse ? (
          <button
            onClick={() => {
              handleEditTask(item?._id);
            }}
            className='list-item__edit-button'
          >
            {isAwaitingEditResponse && taskToEditId === item?._id && (
              <div className='loader'></div>
            )}
            Edit
          </button>
        ) : (
          <button
            onClick={handleCancelEdit}
            className='list-item__cancel-button'
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => {
            handleDeleteTask(item?._id);
            setIsOpen(false);
          }}
          className='list-item__delete-button'
        >
          {isAwaitingDeleteResponse && <div className='loader'></div>}
          Delete
        </button>
      </div>
    </div>
  );
};

export default ItemList;
