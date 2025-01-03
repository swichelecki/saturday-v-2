'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context';
import {
  SettingsItem,
  Modal,
  ModalCategory,
  FormErrorMessage,
  Toast,
} from '../../components';
import { deleteCategory, updateCategory } from '../../actions';
import { handleModalResetPageScrolling } from '../../utilities';
import {
  MODAL_CREATE_CATEGORY_HEADLINE,
  CATEGORY_ITEM_LIMIT,
} from '../../constants';

const CategoryControls = ({ categories, userId, newUser }) => {
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);
  const categoryItemWrapperRef = useRef(null);

  const {
    setShowToast,
    setShowModal,
    isCategoriesPrompt,
    isDashboardPrompt,
    prompt,
  } = useAppContext();

  const [categoryItems, setCategoryItems] = useState(categories ?? []);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [draggableCategories, setDraggableCategories] = useState([]);
  const [atCategoryLimit, setAtCategoryLimit] = useState(false);

  // remove at-category-limit message after category deletion
  useEffect(() => {
    if (categoryItems?.length < CATEGORY_ITEM_LIMIT && atCategoryLimit) {
      setAtCategoryLimit(false);
    }
  }, [categoryItems]);

  // delete category
  const handleDeleteCategory = (_id) => {
    setIsAwaitingDeleteResponse(true);

    deleteCategory(userId, _id).then((res) => {
      if (res.status === 200) {
        setCategoryItems(categoryItems.filter((item) => item._id !== _id));
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setShowModal(null);
      handleModalResetPageScrolling();
      setIsAwaitingDeleteResponse(false);
    });
  };

  // handle item reordering
  useEffect(() => {
    const copyOfCategories = [...categoryItems];
    setDraggableCategories(copyOfCategories);
  }, [categoryItems]);

  const handleDragStart = (index) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index) => {
    const dragItemIndex = dragItemRef.current;
    const dragOverItemIndex = index;

    if (index !== dragItemRef.current) {
      setDraggableCategories(() => {
        draggableCategories.splice(
          dragOverItemIndex,
          0,
          draggableCategories.splice(dragItemIndex, 1)[0]
        );
        return draggableCategories;
      });
      dragItemRef.current = dragOverItemIndex;
    }
  };

  const handleDragEnd = () => {
    dragItemRef.current = null;
    dragOverItemRef.current = null;

    const draggableCategoriesWithNewPriorities = draggableCategories?.map(
      (item, index) => ({
        ...item,
        priority: index + 1,
      })
    );

    draggableCategoriesWithNewPriorities?.forEach((item) =>
      updateCategory(item).then((res) => {
        if (res.status !== 200) {
          setShowToast(<Toast serverError={res} />);
        }
      })
    );

    setCategoryItems([...draggableCategoriesWithNewPriorities]);
  };

  return (
    <>
      <h1 className='form-page__h2'>Categories</h1>
      <div className='settings-controls'>
        {isCategoriesPrompt && prompt}
        {isDashboardPrompt && prompt}
        <div className='settings-controls__button-wrapper'>
          <button
            onClick={() => {
              if (categoryItems?.length < CATEGORY_ITEM_LIMIT) {
                setShowModal(
                  <Modal className='modal modal__form-modal--small'>
                    <h2>{MODAL_CREATE_CATEGORY_HEADLINE}</h2>
                    <ModalCategory
                      userId={userId}
                      items={categoryItems}
                      setItems={setCategoryItems}
                      newUser={newUser}
                      numberOfCategories={categoryItems?.length}
                    />
                  </Modal>
                );
              } else {
                setAtCategoryLimit(true);
              }
            }}
            type='button'
            className='form-page__save-button'
            id='createCategoryButton'
          >
            Create
          </button>
          {atCategoryLimit && (
            <FormErrorMessage
              errorMessage={`Limit ${CATEGORY_ITEM_LIMIT} Categories!`}
              className='form-error-message form-error-message--position-static'
            />
          )}
          <p>
            Create up to 12 categories representing areas of your life in which
            you could use a bit of help keeping track of things&#8212;work,
            school, shopping, appointments, events, etc.
          </p>
        </div>
        <div
          className='settings-controls__list-wrapper'
          ref={categoryItemWrapperRef}
        >
          {categoryItems?.map((item, index) => (
            <SettingsItem
              key={`category-item_${index}`}
              item={item}
              index={index}
              handleDeleteItem={handleDeleteCategory}
              isAwaitingDeleteResponse={isAwaitingDeleteResponse}
              handleDragStart={handleDragStart}
              handleDragEnter={handleDragEnter}
              handleDragEnd={handleDragEnd}
              categoryItemWrapperRef={categoryItemWrapperRef}
              numberOfItemsInColumn={categoryItems?.length}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryControls;
