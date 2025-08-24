'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context';
import { useInnerWidth, useListItemsMobileReset } from '../../hooks';
import {
  ListItem,
  Modal,
  ModalConfirm,
  ModalCategory,
  ModalSubscribe,
  FormErrorMessage,
  Toast,
  CTA,
} from '../../components';
import { deleteCategory, updateCategory, getCategory } from '../../actions';
import { handleModalResetPageScrolling } from '../../utilities';
import {
  CATEGORY_ITEM_LIMIT,
  UNSUBSCRIBED_CATEGORY_ITEM_LIMIT,
  ITEM_TYPE_CATEGORY,
  MOBILE_BREAKPOINT,
} from '../../constants';

const CategoryControls = ({ categories, user }) => {
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

  const { userId, newUser, isSubscribed } = user;

  const [categoryItems, setCategoryItems] = useState(categories ?? []);
  const [draggableCategories, setDraggableCategories] = useState([]);
  const [atCategoryLimit, setAtCategoryLimit] = useState(false);
  const [isAwatingGetItem, setIsAwaitingGetItem] = useState(false);
  const [itemToUpdateId, setItemToUpdateId] = useState('');

  const categoryLimit = isSubscribed
    ? CATEGORY_ITEM_LIMIT
    : UNSUBSCRIBED_CATEGORY_ITEM_LIMIT;

  // remove at-category-limit message after category deletion
  useEffect(() => {
    if (categoryItems?.length < categoryLimit && atCategoryLimit) {
      setAtCategoryLimit(false);
    }
  }, [categoryItems]);

  // open modal for create
  const handleOpenCategoryModal = () => {
    if (categoryItems?.length >= categoryLimit) {
      setAtCategoryLimit(true);
      setShowModal(
        <Modal className='modal modal__form-modal--small modal__subscription-modal'>
          <ModalSubscribe userId={userId} />
        </Modal>
      );
      return;
    }

    setShowModal(
      <Modal className='modal modal__form-modal--small'>
        <h2>Create Category</h2>
        <ModalCategory
          userId={userId}
          setItems={setCategoryItems}
          newUser={newUser}
          numberOfItems={categoryItems?.length}
        />
      </Modal>
    );
  };

  // open modal for update
  const getItemToUpdate = (id) => {
    setIsAwaitingGetItem(true);
    setItemToUpdateId(id);
    getCategory(id, userId).then((res) => {
      if (res.status === 200) {
        setShowModal(
          <Modal className='modal modal__form-modal--small'>
            <h2>Update Category</h2>
            <ModalCategory
              userId={userId}
              setItems={setCategoryItems}
              itemToUpdate={res.item}
              numberOfItems={categoryItems?.length}
            />
          </Modal>
        );
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setIsAwaitingGetItem(false);
    });
  };

  // delete category
  const handleDeleteCategory = (id, confirmDeletion) => {
    if (confirmDeletion) {
      setShowModal(
        <Modal showCloseButton={false}>
          <ModalConfirm
            handleConfirm={handleDeleteCategory}
            confirmId={id}
            confirmType='Delete'
            className='cta-button--red'
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
        itemLimit: categoryItems?.length,
      })
    );

    draggableCategoriesWithNewPriorities?.forEach((item) => {
      updateCategory(item, false).then((res) => {
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
          <CTA
            text='Create'
            className='cta-button cta-button--small cta-button--green'
            ariaLabel='Create dashboard item category'
            handleClick={handleOpenCategoryModal}
          />
          {atCategoryLimit && (
            <FormErrorMessage
              errorMessage={`Limit ${categoryLimit} Categories!`}
              className='form-error-message form-error-message--position-static'
            />
          )}
          <p>
            Create categories representing areas of your life in which you could
            use a bit of help keeping track of things&#8212;work, school,
            shopping, appointments, events, etc.
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
              getItemToUpdate={getItemToUpdate}
              isAwaitingEditResponse={isAwatingGetItem}
              itemToUpdateId={itemToUpdateId}
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
