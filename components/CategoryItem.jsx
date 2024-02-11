import { useState, useEffect, useRef } from 'react';
import { useAppContext } from 'context';
import { Modal } from '../components';
import { GrDrag } from 'react-icons/gr';
import { RiDeleteBin7Fill } from 'react-icons/ri';
import { FaCalendarCheck } from 'react-icons/fa';

const CategoryItem = ({
  item,
  index,
  handleDeleteCategory,
  isAwaitingDeleteResponse,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
  categoryItemWrapperRef,
  numberOfItemsInColumn,
}) => {
  const categoryItemRef = useRef(null);
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
    const categoryItemWrapper = categoryItemWrapperRef.current;
    arrayOfCategoryItemsRef.current = [
      ...categoryItemWrapper.querySelectorAll('.category-item__wrapper'),
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

    categoryItemRef.current.addEventListener(
      'touchmove',
      (e) => handlePreventScroll(e),
      { passive: false }
    );

    return () => {
      categoryItemRef.current?.removeEventListener(
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
      categoryItemRef.current.clientHeight * index
    );
    setCategoryItemId(categoryItemRef.current.id);
    startingIndexRef.current = index;

    // set height of list item wrapper
    const handleWrapperHeight = (numberOfItems) => {
      return numberOfItems * categoryItemRef.current.clientHeight;
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

    categoryItemRef.current.style.zIndex = '2';

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
            categoryItemRef.current.clientHeight
        )
      )
    );

    // move up and trigger array resort and dom update
    if (
      currentTranslateY > 0 &&
      currentTranslateY <
        categoryItemRef.current.clientHeight * (startingIndexRef.current - 1) +
          categoryItemRef.current.clientHeight / 2
    ) {
      startingIndexRef.current -= 1;
      handleDragEnter(startingIndexRef.current);

      arrayOfCategoryItemsRef.current?.forEach((item) => {
        // moves item down when item dragged over it
        if (
          parseInt(item.dataset.categoryItemIndex) === startingIndexRef.current
        ) {
          item.style.top = `${
            item.clientHeight * (parseInt(item.dataset.categoryItemIndex) + 1)
          }px`;
          item.setAttribute(
            'data-category-item-index',
            parseInt(item.dataset.categoryItemIndex) + 1
          );
        }

        // sets new index for item being dragged
        if (categoryItemId === item.id) {
          item.setAttribute(
            'data-category-item-index',
            parseInt(item.dataset.categoryItemIndex) - 1
          );
        }
      });
    }

    // move down and trigger array resort and dom update
    if (
      currentTranslateY <
        categoryItemWrapperRef.current.clientHeight -
          categoryItemRef.current.clientHeight &&
      currentTranslateY >
        categoryItemRef.current.clientHeight * startingIndexRef.current +
          categoryItemRef.current.clientHeight / 2
    ) {
      startingIndexRef.current += 1;
      handleDragEnter(startingIndexRef.current);

      arrayOfCategoryItemsRef.current?.forEach((item) => {
        // moves item up when item dragged over it
        if (
          parseInt(item.dataset.categoryItemIndex) === startingIndexRef.current
        ) {
          item.style.top = `${
            item.clientHeight * (parseInt(item.dataset.categoryItemIndex) - 1)
          }px`;
          item.setAttribute(
            'data-category-item-index',
            parseInt(item.dataset.categoryItemIndex) - 1
          );
        }

        // sets new index for item being dragged
        if (categoryItemId === item.id) {
          item.setAttribute(
            'data-category-item-index',
            parseInt(item.dataset.categoryItemIndex) + 1
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
      item.setAttribute('data-category-item-index', parseInt(i));
    });

    cancelAnimationFrame(animationYIdRef.current);

    if (e.type.includes('mouse')) e.target.style.cursor = 'grab';
  };

  // animate y-axis
  const animationY = () => {
    if (isDraggingYRef.current) {
      categoryItemRef.current.style.top = `${currentTranslateY}px`;
      requestAnimationFrame(animationY);
    }
  };

  return (
    <div
      className='category-item__wrapper'
      id={`category-item_${index}`}
      ref={categoryItemRef}
      data-category-item-index={index}
    >
      <div className='category-item__inner-wrapper'>
        <div
          className='category-item__drag-zone'
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
        {item?.mandatoryDate && <FaCalendarCheck />}
        {item?.type}
        <button
          onClick={() => {
            setShowModal(
              <Modal
                handleDeleteItem={handleDeleteCategory}
                modalIdToDelete={item?._id}
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
  );
};

export default CategoryItem;
