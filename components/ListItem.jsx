import { useState, useRef } from 'react';
import Link from 'next/link';
import moment from 'moment-timezone';
import { deleteTask } from '../services';

const ItemList = ({
  item,
  handleDeleteGlobalContextTask,
  handleEditTask,
  handleCancelEdit,
  isAwaitingEditResponse,
  taskToEditId,
  index,
  dragging,
  handleDragStyles,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
}) => {
  const detailsRef = useRef(null);
  const detailsRefCurrent = detailsRef?.current;

  const [isOpen, setIsOpen] = useState(false);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);

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

  const handleDeleteTask = (id) => {
    if (isOpen) {
      setIsOpen((prevState) => !prevState);
    }
    setIsAwaitingDeleteResponse(true);
    deleteTask(id).then((res) => {
      handleDeleteGlobalContextTask(id);
      setIsAwaitingDeleteResponse(false);
    });
  };

  return (
    <div
      className={dragging ? handleDragStyles(index) : 'list-item'}
      draggable
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
      <div className='list-item__interface'>
        <div className='list-item__controls-left'>
          {item?.date || item?.dateAndTime ? (
            <button
              onClick={handleShowDetails}
              className='list-item__details-button'
            >
              Details
            </button>
          ) : taskToEditId !== item?._id || isAwaitingEditResponse ? (
            <button
              onClick={() => handleEditTask(item?._id)}
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
          <p>{item?.title}</p>
        </div>
        <button
          onClick={() => handleDeleteTask(item?._id)}
          className='list-item__delete-button'
        >
          {isAwaitingDeleteResponse && <div className='loader'></div>}
          Delete
        </button>
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
          <div className='list-item__details-controls-left'>
            <Link href={`/details/${item?._id}`}>
              <span className='list-item__details-edit-button'>Edit</span>
            </Link>
            {item?.dateAndTime ? (
              <p>
                {moment(item?.dateAndTime)
                  .tz('America/Chicago')
                  .format('dddd, MMMM D, h:mm A')}
              </p>
            ) : (
              <p>
                {moment(item?.date?.split('T')[0])
                  .tz('America/Chicago')
                  .format('dddd, MMMM D')}
              </p>
            )}
          </div>
          {item?.description && (
            <div
              className='list-item__details-quill-wrapper'
              dangerouslySetInnerHTML={{ __html: item?.description }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemList;
