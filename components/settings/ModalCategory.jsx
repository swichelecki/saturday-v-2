'use client';

import { useState } from 'react';
import { FormTextField, FormCheckboxField, Toast, CTA } from '../../components';
import { createCategory, updateCategory } from '../../actions';
import { useAppContext } from '../../context';
import { useInnerWidth, useListItemsMobileReset } from '../../hooks';
import { categorySchema } from '../../schemas/schemas';
import { handleModalResetPageScrolling } from '../../utilities';
import {
  MOBILE_BREAKPOINT,
  MODAL_CATEGORY_ALREADY_EXISTS,
} from '../../constants';

const ModalCategory = ({
  userId,
  setItems,
  itemToUpdate,
  newUser,
  numberOfItems,
}) => {
  const { setShowModal, setShowToast, setIsDashboardPrompt } = useAppContext();

  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();

  const isUpdate = !!Object.keys(itemToUpdate ?? {}).length;

  const [form, setForm] = useState({
    _id: itemToUpdate?._id ?? '',
    userId: itemToUpdate?.userId ?? userId,
    priority: itemToUpdate?.priority ?? '',
    title: itemToUpdate?.title ?? '',
    mandatoryDate: itemToUpdate?.mandatoryDate ?? false,
    confirmDeletion: itemToUpdate?.confirmDeletion ?? true,
    itemLimit: isUpdate ? numberOfItems - 1 : numberOfItems,
  });
  const [errorMessage, setErrorMessage] = useState({
    title: '',
  });
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
    useState(false);

  // state handlers
  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
      priority: itemToUpdate?.priority || numberOfItems + 1,
    });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  const handleMandatoryDate = (e) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  // create or update category
  const onSubmit = (e) => {
    e.preventDefault();

    const zodValidationResults = categorySchema.safeParse(form);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { title } = error.flatten().fieldErrors;

      if (!title) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      return setErrorMessage({ title: title?.[0] });
    }

    setIsAwaitingSubmitResponse(true);
    isUpdate
      ? updateCategory(zodFormData, true).then((res) => {
          if (res.status === 200) {
            setItems((current) => {
              return current.map((item) => {
                if (item?._id === itemToUpdate?._id) {
                  return {
                    ...item,
                    title: res?.item?.title,
                    mandatoryDate: res?.item?.mandatoryDate,
                  };
                } else {
                  return item;
                }
              });
            });
            if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
          }

          if (res.status === 409) {
            setErrorMessage({ title: MODAL_CATEGORY_ALREADY_EXISTS });
            setIsAwaitingSubmitResponse(false);
            return;
          }

          if (res.status === 500) {
            setShowToast(<Toast serverError={res} />);
          }

          setIsAwaitingSubmitResponse(false);
          handleCloseModal();
        })
      : createCategory(zodFormData).then((res) => {
          if (res.status === 200) {
            setItems((current) => [...current, res.item]);
            setForm({
              userId,
              priority: '',
              title: '',
              mandatoryDate: false,
            });
            if (newUser) setIsDashboardPrompt(true);
            if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
          }

          if (res.status === 409) {
            setErrorMessage({ title: MODAL_CATEGORY_ALREADY_EXISTS });
            setIsAwaitingSubmitResponse(false);
            return;
          }

          if (res.status === 500) {
            setShowToast(<Toast serverError={res} />);
          }

          setIsAwaitingSubmitResponse(false);
          handleCloseModal();
        });
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setForm({
      userId,
      priority: '',
      title: '',
      mandatoryDate: false,
      confirmDeletion: true,
    });
    setErrorMessage({ title: '' });
    handleModalResetPageScrolling();
  };

  return (
    <form onSubmit={onSubmit}>
      <FormTextField
        label='Category Name'
        subLabel='Sum it up in one or two words (e.g., Schoolwork, Grocery List, Work, Appointments, Events, etc.)'
        type='text'
        id='category'
        name='title'
        value={form?.title}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.title}
      />
      <FormCheckboxField
        label='Date or Date & Time'
        subLabel='Check the box if this category requires dates or dates and times. This option allows you to add additional details as well.'
        id='categoryDateTimeCheckbox'
        name='mandatoryDate'
        checked={form?.mandatoryDate}
        onChangeHandler={handleMandatoryDate}
      />
      <div className='modal__modal-button-wrapper'>
        <CTA
          text='Cancel'
          className='cta-button cta-button--medium cta-button--full cta-button--orange'
          ariaLabel='Close modal'
          handleClick={handleCloseModal}
        />
        <CTA
          text='Save'
          btnType='submit'
          className='cta-button cta-button--medium cta-button--full cta-button--green'
          ariaLabel='Save dashboard item category'
          showSpinner={isAwaitingSubmitResponse}
        />
      </div>
    </form>
  );
};

export default ModalCategory;
