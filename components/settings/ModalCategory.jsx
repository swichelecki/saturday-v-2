'use client';

import { useState } from 'react';
import { FormTextField, FormCheckboxField, Toast } from '../../components';
import { createCategory, updateCategory } from '../../actions';
import { useAppContext } from '../../context';
import { useInnerWidth, useListItemsMobileReset } from '../../hooks';
import { categorySchema } from '../../schemas/schemas';
import { handleModalResetPageScrolling } from '../../utilities';
import { MOBILE_BREAKPOINT } from '../../constants';

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
    setForm({ ...form, mandatoryDate: e.target.checked });
  };

  // create or update category
  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const categorySchemaValidated = categorySchema.safeParse({
      _id: formData.get('_id'),
      userId: formData.get('userId'),
      priority: formData.get('priority'),
      title: formData.get('title'),
      mandatoryDate: formData.get('mandatoryDate'),
      confirmDeletion: formData.get('confirmDeletion'),
      itemLimit: isUpdate ? numberOfItems - 1 : numberOfItems,
    });

    const { success, error } = categorySchemaValidated;
    if (!success) {
      const { title } = error.flatten().fieldErrors;

      if (!title) {
        const serverError = {
          status: 400,
          error: 'Invalid FormData. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      return setErrorMessage({ title: title?.[0] });
    }

    setIsAwaitingSubmitResponse(true);
    isUpdate
      ? updateCategory(formData).then((res) => {
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

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }

          setIsAwaitingSubmitResponse(false);
          handleCloseModal();
        })
      : createCategory(formData).then((res) => {
          if (res.status === 200) {
            setItems((current) => [...current, res.item]);
            setForm({ userId, priority: '', title: '', mandatoryDate: false });
            if (newUser) setIsDashboardPrompt(true);
            if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
          }

          if (res.status !== 200) {
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
      <input type='hidden' name='_id' value={itemToUpdate?._id || ''} />
      <input type='hidden' name='userId' value={form?.userId || userId} />
      <input type='hidden' name='priority' value={form?.priority} />
      <input type='hidden' name='confirmDeletion' value='true' />
      <div className='modal__modal-button-wrapper'>
        <button
          onClick={handleCloseModal}
          type='button'
          className='modal__cancel-button'
        >
          Cancel
        </button>
        <button type='submit' className='modal__save-button'>
          {isAwaitingSubmitResponse && <div className='loader'></div>}
          Save
        </button>
      </div>
    </form>
  );
};

export default ModalCategory;
