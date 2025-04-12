'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppContext } from '../../context';
import { createItem } from '../../actions';
import { useInnerWidth, useListItemsMobileReset } from '../../hooks';
import { FormCheckboxField, FormTextField, Toast } from '../../components';
import { handleModalResetPageScrolling } from '../../utilities';
import { itemSchema } from '../../schemas/schemas';
import { MOBILE_BREAKPOINT } from '../../constants';

const ModalCreateItem = ({
  userId,
  categories,
  items,
  setItems,
  totalNumberOfItems,
}) => {
  const { setShowModal, setShowToast } = useAppContext();

  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();

  const formRef = useRef(null);

  const [form, setForm] = useState({
    _id: '',
    userId,
    categoryId: categories?.length ? categories[0]['_id'] : '',
    title: '',
    column: 1,
    priority: 1,
    type: categories?.length ? categories[0]['title'] : '',
    description: '',
    date: '',
    dateAndTime: '',
    mandatoryDate: false,
    confirmDeletion: false,
    itemLimit: 0,
  });
  const [priority, setPriority] = useState(0);
  const [checkbox, setCheckbox] = useState(false);
  const [isCheckedByUser, setIsCheckedByUser] = useState(false);
  const [hasMandatoryDate, setHasMandatoryDate] = useState(false);
  const [isAwaitingAddResponse, setIsAwaitingAddResponse] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: '',
  });

  // set priority of next new item
  useEffect(() => {
    if (!form?.type) return;

    const selectedCategoryData = items.find(
      (category) => Object.keys(category)[0] === form?.type
    );

    if (typeof selectedCategoryData === 'undefined') {
      setPriority(1);
      return;
    }

    const priorityOfNewItem = Object.values(selectedCategoryData)[0].length + 1;

    setPriority(priorityOfNewItem);
  }, [form]);

  // ensure list item always has correct priorty of next new item
  useEffect(() => {
    setForm({
      ...form,
      priority,
    });
  }, [priority]);

  useEffect(() => {
    setForm({
      ...form,
      itemLimit: totalNumberOfItems,
    });
  }, [totalNumberOfItems]);

  // check if first category has detailed view on page load
  useEffect(() => {
    if (categories[0]?.mandatoryDate) {
      setCheckbox(true);
      setHasMandatoryDate(true);
    }
  }, []);

  const handleSetCheckbox = (e) => {
    setCheckbox(e.target.checked);
    setIsCheckedByUser((current) => !current);
  };

  // set item title and priority
  const handleSetListItem = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (errorMessage) {
      setErrorMessage({ title: '' });
    }
  };

  // create new item
  const handleOnSubmit = (e) => {
    e.preventDefault();

    const zodValidationResults = itemSchema.safeParse({
      ...form,
      isDetailsForm: false,
    });
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { title, itemLimit } = error.flatten().fieldErrors;

      if (!title && !itemLimit) {
        const serverError = {
          status: 400,
          error: 'Invalid FormData. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage({ title: title?.[0] });
      return;
    }

    setIsAwaitingAddResponse(true);
    createItem(zodFormData, false).then((res) => {
      if (res.status === 200) {
        setItems(
          items.map((item) => {
            if (Object.keys(item)[0] === res.item.type) {
              return {
                [Object.keys(item)[0]]: [...Object.values(item)[0], res.item],
              };
            } else {
              return item;
            }
          })
        );

        if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
        setForm({ ...form, title: '' });
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      handleCloseModal();
    });
  };

  const handleCloseModal = () => {
    setIsAwaitingAddResponse(false);
    setShowModal(null);
    setForm({
      _id: '',
      userId,
      categoryId: '',
      title: '',
      column: 1,
      priority: 1,
      type: '',
      description: '',
      date: '',
      dateAndTime: '',
      mandatoryDate: false,
      confirmDeletion: false,
      itemLimit: 0,
    });
    setErrorMessage({ title: '' });
    handleModalResetPageScrolling();
  };

  return (
    <form onSubmit={handleOnSubmit} ref={formRef}>
      <div className='form-field main-controls__select-wrapper'>
        <label htmlFor='categoriesSelect'>Categories</label>
        <div className='form-field__select-wrapper'>
          <select
            id='categoriesSelect'
            onChange={(e) => {
              const category = JSON.parse(e.currentTarget.value);
              setForm((curr) => ({
                ...curr,
                type: category?.title,
                column: category?.priority,
                categoryId: category?._id,
              }));
              setCheckbox((current) =>
                (isCheckedByUser && current === true) || category?.mandatoryDate
                  ? true
                  : false
              );
              setHasMandatoryDate(category?.mandatoryDate);
            }}
          >
            {categories?.map((item, index) => (
              <option
                key={`category-option_${index}`}
                value={JSON.stringify(item)}
              >
                {item?.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!hasMandatoryDate && (
        <FormCheckboxField
          label='Detailed'
          subLabel='All categories with a date are detailed by default. Click the checkbox to add a description to categories without dates.'
          name='detailedCheckbox'
          checked={checkbox}
          onChangeHandler={handleSetCheckbox}
        />
      )}
      {!checkbox && (
        <FormTextField
          label='Title'
          type='text'
          id='itemTitle'
          name='title'
          value={form?.title}
          onChangeHandler={handleSetListItem}
          disabled={checkbox}
          errorMessage={errorMessage.title}
        />
      )}
      <div className='modal__modal-button-wrapper'>
        <button
          onClick={handleCloseModal}
          type='button'
          className='modal__cancel-button'
        >
          Cancel
        </button>
        {checkbox ? (
          <Link
            href={{
              pathname: '/details',
              query: {
                priority,
                type: form?.type,
                column: form?.column,
                hasMandatoryDate: String(hasMandatoryDate),
                categoryId: form?.categoryId,
              },
            }}
            onClick={handleCloseModal}
            className='modal__update-button'
          >
            Create
          </Link>
        ) : (
          <button type='submit' className='modal__save-button'>
            {isAwaitingAddResponse && <div className='loader'></div>}
            Add
          </button>
        )}
      </div>
    </form>
  );
};

export default ModalCreateItem;
