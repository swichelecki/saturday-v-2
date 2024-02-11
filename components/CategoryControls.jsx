import { useState, useEffect, useRef } from 'react';
import { useAppContext } from 'context';
import { FormTextField, FormCheckboxField, CategoryItem } from 'components';
import { createCategory, deleteCategory, updateCategory } from '../services';
import { SETTINGS_MISSING_CATEGORY } from 'constants';

const CategoryControls = ({ categories, userId }) => {
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);
  const categoryItemWrapperRef = useRef(null);

  const { setShowToast, setServerError, setShowModal } = useAppContext();

  const [categoryItems, setCategoryItems] = useState(categories);
  const [form, setForm] = useState({
    userId,
    priority: '',
    type: '',
    mandatoryDate: false,
  });
  const [errorMessage, setErrorMessage] = useState({
    type: '',
  });
  const [isAwaitingCategoryCreation, setIsAwaitingCategoryCreation] =
    useState(false);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [draggableCategories, setDraggableCategories] = useState([]);

  useEffect(() => {
    if (!errorMessage.type) return;
    setErrorMessage({ type: '' });
  }, [form.type]);

  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
      priority: categoryItems?.length + 1,
    });
  };

  const handleMandatoryDate = (e) => {
    setForm({ ...form, mandatoryDate: e.target.checked });
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();

    if (!form.type) {
      setErrorMessage({ type: SETTINGS_MISSING_CATEGORY });
      return;
    }

    setIsAwaitingCategoryCreation(true);
    createCategory(form).then((res) => {
      if (res.status === 200) {
        setCategoryItems((current) => [...current, res.item]);
        setForm({ ...form, type: '', mandatoryDate: false });
      }

      if (res.status !== 200) {
        setServerError(res.status);
        setShowToast(true);
      }

      setIsAwaitingCategoryCreation(false);
    });
  };

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

  useEffect(() => {
    const copyOfCategories = [...categories];
    setDraggableCategories(copyOfCategories);
  }, [categories]);

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

  if (!categoryItems?.length) {
    return null;
  }

  return (
    <section>
      <h2>Manage Categories</h2>
      <div className='category-controls'>
        <div className='category-controls__form-wrapper'>
          <form onSubmit={handleCreateCategory}>
            <FormTextField
              label={'Category'}
              type={'text'}
              id={'category'}
              name={'type'}
              value={form?.type}
              onChangeHandler={handleForm}
              errorMessage={errorMessage.type}
            />
            <FormCheckboxField
              label={'Date or Date & Time'}
              checked={form?.mandatoryDate}
              onChangeHandler={handleMandatoryDate}
            />
            <div className='form-page__buttons-wrapper'>
              <button
                type='submit'
                className='form-page__save-button form-page__update-button'
              >
                {isAwaitingCategoryCreation && <div className='loader'></div>}
                Create
              </button>
            </div>
          </form>
        </div>
        <div
          className='category-controls__categories-wrapper'
          ref={categoryItemWrapperRef}
        >
          {categoryItems?.map((item, index) => (
            <CategoryItem
              key={`category-item_${index}`}
              item={item}
              index={index}
              handleDeleteCategory={handleDeleteCategory}
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
    </section>
  );
};

export default CategoryControls;
