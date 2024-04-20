import { useState, useEffect, useRef } from 'react';
import { useAppContext } from 'context';
import { Modal } from './';
import { Tooltip } from './';
import { handleReminderBufferFormat } from 'utilities';
import moment from 'moment-timezone';
import { GrDrag, GrMore } from 'react-icons/gr';
import { RiDeleteBin7Fill } from 'react-icons/ri';
import { MdEdit } from 'react-icons/md';
import { MODAL_CONFIRM_DELETION_HEADLINE } from 'constants';

const SettingsItem = ({
  item,
  index,
  handleDeleteItem,
  isAwaitingDeleteResponse,
  handleDragStart = () => {},
  handleDragEnter = () => {},
  handleDragEnd = () => {},
  categoryItemWrapperRef = '',
  numberOfItemsInColumn = 0,
  handleUpdateItem = () => {},
  isAwaitingEditResponse = false,
  reminderToEditId = '',
}) => {
  const settingsItemRef = useRef(null);
  const startingIndexRef = useRef(null);
  const isDraggingYRef = useRef(null);
  const animationYIdRef = useRef(null);
  const arrayOfCategoryItemsRef = useRef(null);

  const { setShowModal } = useAppContext();

  const [idToDelete, setIdToDelete] = useState('');
  const [startYPosition, setStartYPosition] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [categoryItemYPositionOnStart, setCategoryItemYPositionOnStart] =
    useState(0);
  const [categoryItemId, setCategoryItemId] = useState('');

  // get array of column list items for touch y-axis dom manipulation
  useEffect(() => {
    if (!categoryItemWrapperRef) return;
    const categoryItemWrapper = categoryItemWrapperRef.current;
    arrayOfCategoryItemsRef.current = [
      ...categoryItemWrapper.querySelectorAll('.settings-item__wrapper'),
    ];
  }, [numberOfItemsInColumn]);

  // disable scrolling on y-axis move
  useEffect(() => {
    const handlePreventScroll = (e) => {
      if (isDraggingYRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    settingsItemRef.current.addEventListener(
      'touchmove',
      (e) => handlePreventScroll(e),
      { passive: false }
    );

    return () => {
      settingsItemRef.current?.removeEventListener(
        'touchmove',
        (e) => handlePreventScroll(e),
        { passive: false }
      );
    };
  }, [isDraggingYRef.current]);

  // initialize and run animations
  useEffect(() => {
    animationYIdRef.current = requestAnimationFrame(animationY);
    return () => {
      cancelAnimationFrame(animationYIdRef.current);
    };
  }, [currentTranslateY]);

  // y-axis start
  const handleDragYStart = (e) => {
    isDraggingYRef.current = true;
    handleDragStart(index);
    setStartYPosition(
      e.type.includes('mouse') ? e.pageY : e.touches[0].clientY
    );
    setCategoryItemYPositionOnStart(
      settingsItemRef.current.clientHeight * index
    );
    setCategoryItemId(settingsItemRef.current.id);
    startingIndexRef.current = index;

    // set height of list item wrapper
    const handleWrapperHeight = (numberOfItems) => {
      return numberOfItems * settingsItemRef.current.clientHeight;
    };

    categoryItemWrapperRef.current.setAttribute(
      'style',
      `height: ${handleWrapperHeight(numberOfItemsInColumn)}px`
    );

    // make each item absolutely positioned
    arrayOfCategoryItemsRef.current?.forEach((item, i) => {
      item.style.position = 'absolute';
      item.style.top = `${item.clientHeight * i}px`;
      item.style.left = '0';
      item.style.right = '0';
      item.style.zIndex = '1';
    });

    settingsItemRef.current.style.zIndex = '2';

    if (e.type.includes('mouse')) e.target.style.cursor = 'grabbing';
  };

  // y-axis move
  const handleDragYMove = (e) => {
    let currentPosition = e.type.includes('mouse')
      ? e.pageY
      : e.touches[0].clientY;

    setCurrentTranslateY(
      Math.max(
        0,
        Math.min(
          categoryItemYPositionOnStart + currentPosition - startYPosition,
          categoryItemWrapperRef.current.clientHeight -
            settingsItemRef.current.clientHeight
        )
      )
    );

    // move up and trigger array resort and dom update
    if (
      currentTranslateY > 0 &&
      currentTranslateY <
        settingsItemRef.current.clientHeight * (startingIndexRef.current - 1) +
          settingsItemRef.current.clientHeight / 2
    ) {
      startingIndexRef.current -= 1;
      handleDragEnter(startingIndexRef.current);

      arrayOfCategoryItemsRef.current?.forEach((item) => {
        // moves item down when item dragged over it
        if (
          parseInt(item.dataset.settingsItemIndex) === startingIndexRef.current
        ) {
          item.style.top = `${
            item.clientHeight * (parseInt(item.dataset.settingsItemIndex) + 1)
          }px`;
          item.setAttribute(
            'data-settings-item-index',
            parseInt(item.dataset.settingsItemIndex) + 1
          );
        }

        // sets new index for item being dragged
        if (categoryItemId === item.id) {
          item.setAttribute(
            'data-settings-item-index',
            parseInt(item.dataset.settingsItemIndex) - 1
          );
        }
      });
    }

    // move down and trigger array resort and dom update
    if (
      currentTranslateY <
        categoryItemWrapperRef.current.clientHeight -
          settingsItemRef.current.clientHeight &&
      currentTranslateY >
        settingsItemRef.current.clientHeight * startingIndexRef.current +
          settingsItemRef.current.clientHeight / 2
    ) {
      startingIndexRef.current += 1;
      handleDragEnter(startingIndexRef.current);

      arrayOfCategoryItemsRef.current?.forEach((item) => {
        // moves item up when item dragged over it
        if (
          parseInt(item.dataset.settingsItemIndex) === startingIndexRef.current
        ) {
          item.style.top = `${
            item.clientHeight * (parseInt(item.dataset.settingsItemIndex) - 1)
          }px`;
          item.setAttribute(
            'data-settings-item-index',
            parseInt(item.dataset.settingsItemIndex) - 1
          );
        }

        // sets new index for item being dragged
        if (categoryItemId === item.id) {
          item.setAttribute(
            'data-settings-item-index',
            parseInt(item.dataset.settingsItemIndex) + 1
          );
        }
      });
    }
  };

  // y-axis end
  const handleDragYEnd = (e) => {
    isDraggingYRef.current = false;
    categoryItemWrapperRef.current.removeAttribute('style');
    handleDragEnd();

    arrayOfCategoryItemsRef.current?.forEach((item, i) => {
      item.style.position = 'relative';
      item.style.top = 'unset';
      item.style.left = 'unset';
      item.style.right = 'unset';
      item.style.zIndex = '1';
      item.setAttribute('data-settings-item-index', parseInt(i));
    });

    cancelAnimationFrame(animationYIdRef.current);

    if (e.type.includes('mouse')) e.target.style.cursor = 'grab';
  };

  // animate y-axis
  const animationY = () => {
    if (isDraggingYRef.current) {
      settingsItemRef.current.style.top = `${currentTranslateY}px`;
      requestAnimationFrame(animationY);
    }
  };

  // handle tooltip message for reminders with exact recurring dates
  let displayDateForExactRecurringReminder;
  if (item?.exactRecurringDate) {
    const date = new Date(item?.reminderDate);
    displayDateForExactRecurringReminder = date.setDate(
      date.getDate() - item?.recurrenceBuffer
    );
  }

  return (
    <div
      className='settings-item__wrapper'
      id={`settings-item_${index}`}
      ref={settingsItemRef}
      data-settings-item-index={index}
    >
      <div className='settings-item__inner-wrapper'>
        <div className='settings-item__title-wrapper'>
          {!item?.reminder && (
            <div
              className='settings-item__drag-zone'
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
          {item?.reminder && !item?.exactRecurringDate && (
            <Tooltip
              icon={<GrMore />}
              message={`<p>${moment(
                new Date(item?.reminderDate).toISOString().split('T')[0]
              ).format('dddd, MMMM D, YYYY')}</p>${
                new Date(item?.reminderDate).getTime() > Date.now()
                  ? '<p>Next Display Date</p>'
                  : '<p>Currently Displayed</p>'
              }`}
            />
          )}
          {item?.reminder && item?.exactRecurringDate && (
            <Tooltip
              icon={<GrMore />}
              message={`<p>${moment(
                new Date(item?.reminderDate).toISOString().split('T')[0]
              ).format('dddd, MMMM D, YYYY')}</p>${
                displayDateForExactRecurringReminder > Date.now()
                  ? '<p>Displays <span>' +
                    handleReminderBufferFormat(item?.recurrenceBuffer) +
                    '</span> Prior</p>'
                  : '<p>Currently Displayed</p>'
              }`}
            />
          )}
          {item?.type ? item?.type : item?.reminder}
        </div>
        <div className='settings-item__button-wrapper'>
          {item?.reminder && (
            <button
              onClick={() => {
                handleUpdateItem(item?._id);
              }}
              className='list-item__edit-button list-item__edit-button--desktop'
            >
              {isAwaitingEditResponse && reminderToEditId === item?._id ? (
                <div className='loader'></div>
              ) : (
                <MdEdit />
              )}
            </button>
          )}
          <button
            onClick={() => {
              setShowModal(
                <Modal
                  handleDeleteItem={handleDeleteItem}
                  modalIdToDelete={item?._id}
                  headlineText={MODAL_CONFIRM_DELETION_HEADLINE}
                />
              );
              setIdToDelete(item?._id);
            }}
            className='list-item__delete-button list-item__delete-button--desktop'
          >
            {isAwaitingDeleteResponse && idToDelete === item?._id ? (
              <div className='loader'></div>
            ) : (
              <RiDeleteBin7Fill />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsItem;
