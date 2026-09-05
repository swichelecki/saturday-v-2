'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAppContext } from '../../context';
import { createItem, createCategory, updateItem } from '../../actions';
import {
  useInnerWidth,
  useListItemsMobileReset,
  useScrollToError,
} from '../../hooks';
import {
  FormCheckboxField,
  FormTextField,
  CTA,
  Tabs,
  FormWYSIWYGField,
} from '..';
import dynamic from 'next/dynamic';
import {
  handleModalResetPageScrolling,
  handleDateAndTimeToUTC,
  handleSortCalendarItemsAsc,
} from '../../utilities';
import { itemSchema, categorySchema } from '../../schemas/schemas';
import {
  MOBILE_BREAKPOINT,
  MODAL_CATEGORY_ALREADY_EXISTS,
} from '../../constants';
import { MdAddCircle } from 'react-icons/md';

const Toast = dynamic(() => import('../shared/Toast'), {
  ssr: false,
});

const ModalCreateItem = ({
  userId,
  categories,
  items,
  setItems,
  totalNumberOfItems,
  timezone,
  isUpdate,
  totalNumberOfCategories,
  itemToUpdate,
  calendarItems,
  setCalendarItems,
}) => {
  const formRef = useRef(null);

  const { setShowModal, setShowToast, globalCategories, setGlobalCategories } =
    useAppContext();
  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();

  const [form, setForm] = useState(() => {
    let priority = 0;
    const type = itemToUpdate?.type ?? categories[0]['title'] ?? '';

    const selectedCategoryData = items.find(
      (category) => Object.keys(category)[0] === type,
    );

    if (typeof selectedCategoryData === 'undefined') {
      priority = 1;
    } else {
      priority = Object.values(selectedCategoryData)[0].length + 1;
    }

    return {
      _id: itemToUpdate?._id ?? '',
      userId: itemToUpdate?.userId ?? userId,
      categoryId: itemToUpdate?.categoryId ?? categories[0]['_id'],
      title: itemToUpdate?.title ?? '',
      description: itemToUpdate.description ?? '',
      confirmDeletion: itemToUpdate?.confirmDeletion ?? false,
      date: itemToUpdate?.date ?? '',
      dateAndTime: itemToUpdate?.dateAndTime ?? '',
      priority: itemToUpdate?.priority ?? priority,
      type: itemToUpdate.type ?? type,
      column: itemToUpdate?.column ?? categories[0]['priority'],
      itemLimit: isUpdate ? totalNumberOfItems - 1 : totalNumberOfItems,
    };
  });
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    description: '',
    date: '',
    dateAndTime: '',
    itemLimit: '',
  });
  const [dashboardItems, setDashboardItems] = useState(items);
  const [categoryItems, setCategoryItems] = useState(
    globalCategories?.length > 0 ? globalCategories : categories,
  );
  const [categoryForm, setCategoryForm] = useState({
    _id: '',
    userId,
    priority: categories?.length + 1,
    title: '',
    confirmDeletion: true,
    itemLimit: totalNumberOfCategories,
  });
  const [categoryErrorMessage, setCategoryErrorMessage] = useState({
    title: '',
    itemLimit: '',
  });
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  useScrollToError(formRef, scrollToErrorMessage, setScrollToErrorMessage);

  const handleSetForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }

    if (e.target.name === 'dateAndTime') {
      setErrorMessage({ ...errorMessage, date: '' });
    }
  };

  const handleConfirmDeletion = (e) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleSetQuill = (value) => {
    if (value === '<p><br></p>') {
      setForm({ ...form, description: '' });
      return;
    }

    setForm({ ...form, description: value });

    if (errorMessage.description) {
      setErrorMessage({ ...errorMessage, description: '' });
    }
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    const zodValidationResults = itemSchema.safeParse({
      ...form,
      dateAndTime: form?.dateAndTime
        ? handleDateAndTimeToUTC(form?.dateAndTime)
        : null,
      date:
        form?.date && !form?.dateAndTime
          ? form?.date
          : form?.dateAndTime?.split('T')[0] || null,
    });
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { title, description, date, itemLimit } =
        error.flatten().fieldErrors;

      if (!title && !description && !date && !itemLimit) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage({
        title: title?.[0],
        description: description?.[0],
        date: date?.[0],
        dateAndTime: date?.[0],
        itemLimit: itemLimit?.[0],
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingResponse(true);
    isUpdate
      ? updateItem(zodFormData).then((res) => {
          if (res.status === 200) {
            setItems(
              items.map((item) => {
                // Update item in same category
                if (
                  Object.values(item)[0].some(
                    (item) => item._id === itemToUpdate?._id,
                  ) &&
                  Object.values(item)[0][0].categoryId === res.item?.categoryId
                ) {
                  return {
                    [Object.keys(item)[0]]: Object.values(item)[0].map(
                      (item) => {
                        if (
                          item._id === itemToUpdate?._id &&
                          item.categoryId === res.item?.categoryId
                        ) {
                          return {
                            ...res.item,
                            date: res.item?.date
                              ? new Date(res.item?.date)
                                  .toISOString()
                                  .split('T')[0]
                              : null,
                            dateAndTime: res.item?.dateAndTime
                              ? new Date(res.item?.dateAndTime).toISOString()
                              : null,
                          };
                        } else {
                          return item;
                        }
                      },
                    ),
                  };
                  // Put item in new category
                } else if (
                  !Object.values(item)[0].some(
                    (item) => item._id === itemToUpdate?._id,
                  ) &&
                  Object.values(item)[0][0].categoryId === res.item.categoryId
                ) {
                  return {
                    [Object.keys(item)[0]]: [
                      ...Object.values(item)[0],
                      {
                        ...res.item,
                        priority: Object.keys(item)[0].length + 1,
                      },
                    ],
                  };
                  // Add non-updated items and filter out item if category changed
                } else {
                  return {
                    [Object.keys(item)[0]]: Object.values(item)[0].filter(
                      (item) => item._id !== itemToUpdate?._id,
                    ),
                  };
                }
              }),
            );

            setCalendarItems(
              calendarItems.map((item) => {
                if (
                  res.item.date?.split('T')[0] === Object.keys(item)[0] ||
                  res.item.dateAndTime?.split('T')[0] === Object.keys(item)[0]
                ) {
                  return {
                    [Object.keys(item)[0]]: handleSortCalendarItemsAsc([
                      ...Object.values(item)[0].filter(
                        (item) => item._id !== itemToUpdate._id,
                      ),
                      res.item,
                    ]),
                  };
                } else {
                  return {
                    [Object.keys(item)[0]]: Object.values(item)[0].filter(
                      (item) => item._id !== itemToUpdate._id,
                    ),
                  };
                }
              }),
            );

            if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
            handleCloseModal();
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }
        })
      : createItem(zodFormData).then((res) => {
          if (res.status === 200) {
            setItems(
              dashboardItems.map((item) => {
                if (Object.keys(item)[0] === res.item.type) {
                  return {
                    [Object.keys(item)[0]]: [
                      ...Object.values(item)[0],
                      {
                        ...res.item,
                        date: res.item?.date
                          ? new Date(res.item?.date).toISOString().split('T')[0]
                          : null,
                        dateAndTime: res.item?.dateAndTime
                          ? new Date(res.item?.dateAndTime).toISOString()
                          : null,
                      },
                    ],
                  };
                } else {
                  return item;
                }
              }),
            );

            setCalendarItems(
              calendarItems.map((item) => {
                if (
                  res.item.date?.split('T')[0] === Object.keys(item)[0] ||
                  res.item.dateAndTime?.split('T')[0] === Object.keys(item)[0]
                ) {
                  return {
                    [Object.keys(item)[0]]: handleSortCalendarItemsAsc([
                      ...Object.values(item)[0],
                      res.item,
                    ]),
                  };
                } else {
                  return item;
                }
              }),
            );

            if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
            handleCloseModal();
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }
        });
  };

  // set item title and priority
  const handleSetCategoryItem = (e) => {
    setCategoryForm({
      ...categoryForm,
      [e.target.name]: e.target.value,
    });

    if (categoryErrorMessage.title) {
      setCategoryErrorMessage({ ...categoryErrorMessage, title: '' });
    }
  };

  // Create a new category
  const handleAddNewCategory = () => {
    const zodValidationResults = categorySchema.safeParse(categoryForm);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { title, itemLimit } = error.flatten().fieldErrors;

      if (!title && !itemLimit) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      return setCategoryErrorMessage({
        title: title?.[0],
        itemLimit: itemLimit?.[0],
      });
    }

    setIsAwaitingResponse(true);
    createCategory(zodFormData).then((res) => {
      if (res.status === 200) {
        setGlobalCategories([...categories, res.item]);
        setCategoryItems((current) => [...current, res.item]);
        setDashboardItems((current) => [...current, { [res.item.title]: [] }]);
        setCategoryForm({
          userId,
          priority: '',
          title: '',
        });
        setForm((curr) => ({
          ...curr,
          type: res.item.title,
          column: res.item.priority,
          categoryId: res.item._id,
        }));

        //if (newUser) setIsDashboardPrompt(true);
        //if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
      }

      if (res.status === 409) {
        setCategoryErrorMessage({ title: MODAL_CATEGORY_ALREADY_EXISTS });
        setIsAwaitingResponse(false);
        return;
      }

      if (res.status === 500) {
        setShowToast(<Toast serverError={res} />);
      }

      setIsAwaitingResponse(false);
    });
  };

  const handleCloseModal = () => {
    setShowModal(null);
    handleModalResetPageScrolling();
  };

  return (
    <>
      <form onSubmit={handleOnSubmit} ref={formRef}>
        {/* Title */}
        <FormTextField
          label='Title'
          type='text'
          id='itemTitle'
          name='title'
          value={form?.title}
          onChangeHandler={handleSetForm}
          errorMessage={errorMessage.title}
        />

        <Tabs tabs={['Category', 'Description', 'Date']} panelsHeight={280}>
          {/* Category panel */}
          <div>
            <div className='form-field'>
              <label htmlFor='categoriesSelect'>Select Category</label>
              <div className='form-field__select-wrapper'>
                <select
                  id='categoriesSelect'
                  value={form?.categoryId ?? ''}
                  onChange={(e) => {
                    const category = categoryItems?.find(
                      (item) => item?._id === e.currentTarget.value,
                    );
                    setForm((curr) => ({
                      ...curr,
                      type: category?.title,
                      column: category?.priority,
                      categoryId: category?._id,
                    }));
                  }}
                >
                  {categoryItems?.map((item, index) => (
                    <option key={`category-option_${index}`} value={item?._id}>
                      {item?.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Create New Category */}
            <div className='form-page__list-items-controls-icon-wrapper'>
              <FormTextField
                label='Or Create New Category'
                type='text'
                id='category'
                name='title'
                value={categoryForm.title}
                onChangeHandler={handleSetCategoryItem}
                errorMessage={categoryErrorMessage.title}
              />
              {/* Add Category CTA */}
              <CTA
                icon={<MdAddCircle />}
                handleClick={handleAddNewCategory}
                className='cta-button cta-button--purple cta-button--icon'
                ariaLabel='Create new category'
                showSpinner={isAwaitingResponse}
              />
            </div>
            {/* Manage Categories */}
            <Link
              href='/settings'
              onClick={() => setShowModal(null)}
              className='cta-text-link'
              style={{
                position: 'relative',
                top: '-24px',
                textDecoration: 'underline',
              }}
            >
              Manage Categories
            </Link>
          </div>

          {/* Description panel */}
          <div>
            <FormWYSIWYGField
              value={form?.description}
              onChangeHandler={handleSetQuill}
              errorMessage={errorMessage.description}
            />
          </div>

          {/* Date or Date and Time panel */}
          <div>
            <FormTextField
              label='Date'
              type='date'
              id='date'
              name='date'
              value={form?.date && !form?.dateAndTime ? form?.date : ''}
              onChangeHandler={handleSetForm}
              errorMessage={errorMessage.date}
              disabled={form?.dateAndTime}
              timezone={timezone}
            />
            <FormTextField
              label='Date & Time'
              type='datetime-local'
              id='dateAndTime'
              name='dateAndTime'
              value={form?.dateAndTime}
              onChangeHandler={handleSetForm}
              errorMessage={errorMessage.date}
              disabled={form?.date && !form?.dateAndTime}
              timezone={timezone}
            />
          </div>
        </Tabs>

        {/* Confirm Deletion */}
        <FormCheckboxField
          label='Confirm Deletion'
          name='confirmDeletion'
          checked={form?.confirmDeletion}
          onChangeHandler={handleConfirmDeletion}
        />

        {/* CTA Buttons */}
        <div className='modal__modal-button-wrapper'>
          <CTA
            text='Cancel'
            className='cta-button cta-button--medium cta-button--full cta-button--cancel'
            ariaLabel='Close modal'
            handleClick={handleCloseModal}
          />
          <CTA
            text={`${isUpdate ? 'Update' : 'Create'}`}
            btnType='submit'
            className='cta-button cta-button--medium cta-button--full cta-button--purple'
            ariaLabel='Add item to dashboard'
            showSpinner={isAwaitingResponse}
          />
        </div>
      </form>
    </>
  );
};

export default ModalCreateItem;
