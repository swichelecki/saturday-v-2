import { useState, useEffect, useRef } from 'react';
import { useAppContext } from 'context';
import { SettingsItem, Modal } from 'components';
import { deleteCategory, updateCategory } from '../services';
import { MODAL_TYPE_CATEGORY, MODAL_CREATE_CATEGORY_HEADLINE } from 'constants';

const CategoryControls = ({ categories, userId }) => {
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);
  const categoryItemWrapperRef = useRef(null);

  const { setShowToast, setServerError, setShowModal } = useAppContext();

  const [categoryItems, setCategoryItems] = useState(categories ?? []);
  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [draggableCategories, setDraggableCategories] = useState([]);

  // control modal
  useEffect(() => {
    if (openCloseModal) {
      setShowModal(
        <Modal
          userId={userId}
          items={categoryItems}
          setItems={setCategoryItems}
          setOpenCloseModal={setOpenCloseModal}
          modalType={MODAL_TYPE_CATEGORY}
          headlineText={MODAL_CREATE_CATEGORY_HEADLINE}
        />
      );
    }
  }, [openCloseModal]);

  // delete category
  const handleDeleteCategory = (_id) => {
    setIsAwaitingDeleteResponse(true);

    deleteCategory({ userId, _id }).then((res) => {
      if (res.status === 200) {
        setCategoryItems(categoryItems.filter((item) => item._id !== _id));
      }

      if (res.status !== 200) {
        setServerError(res.status);
        setShowToast(true);
      }

      setShowModal(null);
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
          setServerError(res.status);
          setShowToast(true);
        }
      })
    );

    setCategoryItems([...draggableCategoriesWithNewPriorities]);
  };

  return (
    <>
      <h2>Manage Categories</h2>
      <div className='settings-controls'>
        <div className='settings-controls__button-wrapper'>
          <button
            onClick={() => {
              setOpenCloseModal(true);
            }}
            className='form-page__save-button'
          >
            Create
          </button>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
            volutpat lacus eleifend tellus cursus iaculis. Morbi bibendum sit
            amet nibh ornare convallis. Proin bibendum non eros at efficitur.
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
