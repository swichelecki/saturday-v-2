'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context';
import { useInnerWidth, useListItemsMobileReset } from '../../hooks';
import {
  ListItem,
  Modal,
  ModalConfirm,
  ModalCategory,
  FormErrorMessage,
  Toast,
} from '../../components';
import { deleteCategory, updateCategory } from '../../actions';
import { handleModalResetPageScrolling } from '../../utilities';
import {
  MODAL_CREATE_CATEGORY_HEADLINE,
  CATEGORY_ITEM_LIMIT,
  ITEM_TYPE_CATEGORY,
  MODAL_CONFIRM_DELETION_HEADLINE,
  MODAL_CONFIRM_DELETE_BUTTON,
  MOBILE_BREAKPOINT,
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

  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();

  const [categoryItems, setCategoryItems] = useState(categories ?? []);
  const [draggableCategories, setDraggableCategories] = useState([]);
  const [atCategoryLimit, setAtCategoryLimit] = useState(false);

  // remove at-category-limit message after category deletion
  useEffect(() => {
    if (categoryItems?.length < CATEGORY_ITEM_LIMIT && atCategoryLimit) {
      setAtCategoryLimit(false);
    }
  }, [categoryItems]);

  // open modal for create
  const handleOpenCategoryModal = () => {
    if (categoryItems?.length >= CATEGORY_ITEM_LIMIT) {
      setAtCategoryLimit(true);
      return;
    }

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
  };

  // delete category
  const handleDeleteCategory = (id, confirmDeletion) => {
    if (confirmDeletion) {
      setShowModal(
        <Modal showCloseButton={false}>
          <h2>{MODAL_CONFIRM_DELETION_HEADLINE}</h2>
          <ModalConfirm
            handleConfirm={handleDeleteCategory}
            confirmId={id}
            confirmBtnText={MODAL_CONFIRM_DELETE_BUTTON}
          />
        </Modal>
      );
      return;
    }

    deleteCategory(userId, id).then((res) => {
      if (res.status === 200) {
        setCategoryItems(categoryItems.filter((item) => item._id !== id));
        if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setShowModal(null);
      handleModalResetPageScrolling();
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

    draggableCategoriesWithNewPriorities?.forEach((item) => {
      updateCategory(item).then((res) => {
        if (res.status !== 200) {
          setShowToast(<Toast serverError={res} />);
        }
      });
    });

    setCategoryItems([...draggableCategoriesWithNewPriorities]);
  };

  return (
    <>
      <div className='form-page__list-items-heading-wrapper'>
        <h1 className='form-page__h2'>Categories</h1>
      </div>
      <div className='settings-controls'>
        {isCategoriesPrompt && prompt}
        {isDashboardPrompt && prompt}
        <div className='settings-controls__button-wrapper'>
          <button
            onClick={handleOpenCategoryModal}
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
            <ListItem
              key={`category-item_${index}`}
              item={item}
              index={index}
              handleDeleteItem={handleDeleteCategory}
              handleDragStart={handleDragStart}
              handleDragEnter={handleDragEnter}
              handleDragEnd={handleDragEnd}
              listItemWrapperRef={categoryItemWrapperRef}
              numberOfItemsInColumn={categoryItems?.length}
              itemType={ITEM_TYPE_CATEGORY}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryControls;
