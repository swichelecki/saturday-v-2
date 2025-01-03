'use client';

import { useState } from 'react';
import { FormTextField, FormCheckboxField, Toast } from '../../components';
import { createCategory } from '../../actions';
import { useAppContext } from '../../context';
import { categorySchema } from '../../schemas/schemas';
import { handleModalResetPageScrolling } from '../../utilities';

const ModalReminder = ({
  userId,
  items,
  setItems,
  newUser,
  numberOfCategories,
}) => {
  const { setShowModal, setShowToast, setIsDashboardPrompt } = useAppContext();

  const [form, setForm] = useState({
    userId,
    priority: '',
    type: '',
    mandatoryDate: false,
  });
  const [errorMessage, setErrorMessage] = useState({
    type: '',
  });
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
    useState(false);

  // state handlers
  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
      priority: items?.length + 1,
    });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  const handleMandatoryDate = (e) => {
    setForm({ ...form, mandatoryDate: e.target.checked });
  };

  // create category
  const handleCreateCategory = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const categorySchemaValidated = categorySchema.safeParse({
      userId: formData.get('userId'),
      priority: formData.get('priority'),
      type: formData.get('type'),
      mandatoryDate: formData.get('mandatoryDate'),
      itemLimit: numberOfCategories,
    });

    const { success, error } = categorySchemaValidated;
    if (!success) {
      const { type } = error.flatten().fieldErrors;

      if (!type) {
        const serverError = {
          status: 400,
          error: 'Invalid FormData. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      return setErrorMessage({ type: type?.[0] });
    }

    setIsAwaitingSubmitResponse(true);
    createCategory(formData).then((res) => {
      if (res.status === 200) {
        setItems((current) => [...current, res.item]);
        setForm({ userId, priority: '', type: '', mandatoryDate: false });
        if (newUser) setIsDashboardPrompt(true);
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
      type: '',
      mandatoryDate: false,
    });
    setErrorMessage({ type: '' });
    handleModalResetPageScrolling();
  };

  return (
    <form onSubmit={handleCreateCategory}>
      <FormTextField
        label='Category Name'
        subLabel='Sum it up in one or two words (e.g., Schoolwork, Grocery List, Work, Appointments, Events, etc.)'
        type='text'
        id='category'
        name='type'
        value={form?.type}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.type}
      />
      <FormCheckboxField
        label='Date or Date & Time'
        subLabel='Check the box if this category requires dates or dates and times. This option allows you to add additional details as well.'
        id='categoryDateTimeCheckbox'
        name='mandatoryDate'
        checked={form?.mandatoryDate}
        onChangeHandler={handleMandatoryDate}
      />
      <input type='hidden' name='userId' value={form?.userId} />
      <input type='hidden' name='priority' value={form?.priority} />
      <div className='modal__modal-button-wrapper'>
        <button
          onClick={() => {
            handleCloseModal();
            handleModalResetPageScrolling();
          }}
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

export default ModalReminder;
