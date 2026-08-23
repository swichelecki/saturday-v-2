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
  Accordion,
  FormWYSIWYGField,
} from '..';
import dynamic from 'next/dynamic';
import {
  handleModalResetPageScrolling,
  handleDateAndTimeToUTC,
  handleSortItemsAscending,
} from '../../utilities';
import { itemSchema, categorySchema } from '../../schemas/schemas';
import { MOBILE_BREAKPOINT } from '../../constants';

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

  /*   const [form, setForm] = useState({
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
  }); */

  /* TODO: 
    - all references to mandatoryDate need to be removed - model, all code 
    - remove mandatoryDate checkbox from ModalCategory
    - global state to handle new category creation on modal open / close
    - find way to close open section when another section is clicked
    - update error messages
    - add tooltips etc.
    - delete all references to isDetailsForm
    */

  const [form, setForm] = useState(() => {
    let priority = 0;
    const type = itemToUpdate?.type ?? categories[0]['title'];

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
      mandatoryDate: false,
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
    mandatoryDate: false,
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

  // const [priority, setPriority] = useState(0);
  //const [checkbox, setCheckbox] = useState(false);
  //const [isCheckedByUser, setIsCheckedByUser] = useState(false);
  //const [hasMandatoryDate, setHasMandatoryDate] = useState(false);
  // const [isAwaitingAddResponse, setIsAwaitingAddResponse] = useState(false);
  /*   const [errorMessage, setErrorMessage] = useState({
    title: '',
  });
 */
  // set priority of next new item
  /*   useEffect(() => {
    if (!form?.type) return;

    const selectedCategoryData = items.find(
      (category) => Object.keys(category)[0] === form?.type,
    );

    if (typeof selectedCategoryData === 'undefined') {
      setPriority(1);
      return;
    }

    const priorityOfNewItem = Object.values(selectedCategoryData)[0].length + 1;

    setPriority(priorityOfNewItem);
  }, []); */

  // ensure list item always has correct priorty of next new item
  /*   useEffect(() => {
    setForm({
      ...form,
      priority,
    });
  }, [priority]); */

  /*   useEffect(() => {
    setForm({
      ...form,
      itemLimit: totalNumberOfItems,
    });
  }, [totalNumberOfItems]); */

  // check if first category has detailed view on page load
  /*   useEffect(() => {
    if (categories[0]?.mandatoryDate) {
      setCheckbox(true);
      setHasMandatoryDate(true);
    }
  }, []); */

  /*   const handleSetCheckbox = (e) => {
    setCheckbox(e.target.checked);
    setIsCheckedByUser((current) => !current);
  }; */

  // set item title and priority
  /*   const handleSetListItem = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (errorMessage) {
      setErrorMessage({ title: '' });
    }
  }; */

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

  // create new item
  /*   const handleOnSubmit = (e) => {
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
    createItem(zodFormData).then((res) => {
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
          }),
        );

        if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
        setForm({ ...form, title: '' });
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      handleCloseModal();
    });
  }; */

  const handleOnSubmit = (e) => {
    e.preventDefault();

    const zodValidationResults = itemSchema.safeParse({
      ...form,
      dateAndTime: form?.dateAndTime
        ? handleDateAndTimeToUTC(form?.dateAndTime)
        : '',
      date:
        form?.date && !form?.dateAndTime
          ? form?.date
          : form?.dateAndTime?.split('T')[0],
      isDetailsForm: true,
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
                if (Object.keys(item)[0] === res.item.type) {
                  return {
                    [Object.keys(item)[0]]: handleSortItemsAscending(
                      Object.values(item)[0].map((item) => {
                        if (item._id === itemToUpdate?._id) {
                          return res.item;
                        } else {
                          return item;
                        }
                      }),
                      res.item.date ? 'date' : 'dateAndTime',
                    ),
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
                    [Object.keys(item)[0]]: [
                      ...Object.values(item)[0].filter(
                        (item) => item._id !== itemToUpdate._id,
                      ),
                      res.item,
                    ],
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
                    [Object.keys(item)[0]]: handleSortItemsAscending(
                      [...Object.values(item)[0], res.item],
                      res.item.date ? 'date' : 'dateAndTime',
                    ),
                  };
                } else {
                  return item;
                }
              }),
            );

            setCalendarItems(
              calendarItems.map((item) => {
                if (res.item.date?.split('T')[0] === Object.keys(item)[0]) {
                  return {
                    [Object.keys(item)[0]]: [
                      ...Object.values(item)[0],
                      res.item,
                    ],
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

    if (errorMessage) {
      setCategoryErrorMessage({ title: '', itemLimit: '' });
    }
  };

  const handleAddNewCategory = () => {
    // e.preventDefault();

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

      return setErrorMessage({ title: title?.[0], itemLimit: itemLimit?.[0] });
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
          mandatoryDate: false,
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
    //setIsAwaitingResponse(false);
    setShowModal(null);
    /*   setForm({
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
    setCategoryForm({
      userId,
      priority: '',
      title: '',
      mandatoryDate: false,
    });
    setErrorMessage({
      title: '',
      description: '',
      date: '',
      dateAndTime: '',
      itemLimit: '',
    });
    setCategoryErrorMessage({ title: '', itemLimit: '' }); */
    handleModalResetPageScrolling();
  };

  return (
    <>
      {/*   <h2>Create Item</h2> */}
      <form onSubmit={handleOnSubmit} ref={formRef}>
        {/* Title */}
        <FormTextField
          label='Title'
          type='text'
          id='itemTitle'
          name='title'
          value={form?.title}
          //onChangeHandler={handleSetListItem}
          onChangeHandler={handleSetForm}
          errorMessage={errorMessage.title}
        />
        <div className='accordion__accordion-wrapper'>
          {/* Category */}
          <Accordion title='Category'>
            <div className='accordion__child'>
              <div className='form-field main-controls__select-wrapper'>
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
                      <option
                        key={`category-option_${index}`}
                        value={item?._id}
                      >
                        {item?.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Create New Category */}
              <FormTextField
                label='Or Create New Category'
                //subLabel='Sum it up in one or two words (e.g., Schoolwork, Grocery List, Work, Appointments, Events, etc.)'
                type='text'
                id='category'
                name='title'
                value={categoryForm.title}
                onChangeHandler={handleSetCategoryItem}
                errorMessage={categoryErrorMessage.title}
              />
              <div className='accordion__button-wrapper'>
                {/* Add Category CTA */}
                <CTA
                  handleClick={handleAddNewCategory}
                  text='Create Category'
                  className='cta-button cta-button--small cta-button--purple'
                  ariaLabel='Create new category'
                  showSpinner={isAwaitingResponse}
                />
                {/* Manage Categories */}
                <Link
                  href='/settings'
                  prefetch={false}
                  onClick={() => setShowModal(null)}
                  className='cta-button cta-button--small cta-button--cancel'
                >
                  Manage Categories
                </Link>
              </div>
            </div>
          </Accordion>
          {/* Description */}
          <Accordion title='Description'>
            <div className='accordion__child'>
              <FormWYSIWYGField
                label='Description'
                value={form?.description}
                onChangeHandler={handleSetQuill}
                // errorMessage={errorMessage.description}
              />
            </div>
          </Accordion>
          {/* Date or Date and Time */}
          <Accordion title='Date'>
            <div className='accordion__child'>
              <FormTextField
                label='Date'
                type='date'
                id='date'
                name='date'
                value={form?.date && !form?.dateAndTime ? form?.date : ''}
                onChangeHandler={handleSetForm}
                //errorMessage={errorMessage.date}
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
                //errorMessage={errorMessage.date}
                disabled={form?.date && !form?.dateAndTime}
                timezone={timezone}
              />
            </div>
          </Accordion>
        </div>
        {/* Confirm Deletion */}
        <FormCheckboxField
          label='Confirm Deletion'
          name='confirmDeletion'
          checked={form?.confirmDeletion}
          onChangeHandler={handleConfirmDeletion}
        />

        {/*         {!hasMandatoryDate && (
          <FormTextField
            label='Title'
            type='text'
            id='itemTitle'
            name='title'
            value={form?.title}
            onChangeHandler={handleSetListItem}
            errorMessage={errorMessage.title}
          />
        )} */}
        {/*  {!hasMandatoryDate && (
          <FormCheckboxField
            label='Add Description'
            name='detailedCheckbox'
            checked={checkbox}
            onChangeHandler={handleSetCheckbox}
          />
        )} */}
        <div className='modal__modal-button-wrapper'>
          <CTA
            text='Cancel'
            className='cta-button cta-button--medium cta-button--full cta-button--cancel'
            ariaLabel='Close modal'
            handleClick={handleCloseModal}
          />
          <CTA
            text='Add'
            btnType='submit'
            className='cta-button cta-button--medium cta-button--full cta-button--purple'
            ariaLabel='Add item to dashboard'
            showSpinner={isAwaitingResponse}
          />
          {/*         {checkbox ? (
            <CTA
              text='Create'
              type='anchor'
              href={{
                pathname: '/details',
                query: {
                  priority,
                  type: form?.type,
                  column: form?.column,
                  hasMandatoryDate: String(hasMandatoryDate),
                  categoryId: form?.categoryId,
                  ...(form?.title && { title: form?.title }),
                },
              }}
              className='cta-button cta-button--medium cta-button--full cta-button--purple'
              handleClick={handleCloseModal}
              ariaLabel='Create detailed item for dashboard'
            />
          ) : (
            <CTA
              text='Add'
              btnType='submit'
              className='cta-button cta-button--medium cta-button--full cta-button--purple'
              ariaLabel='Add item to dashboard'
              showSpinner={isAwaitingAddResponse}
            />
          )} */}
        </div>
      </form>
    </>
  );
};

export default ModalCreateItem;
