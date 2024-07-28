'use client';

import { useState, useEffect } from 'react';
import { FormTextField, FormCheckboxField, Toast } from '../../components';
import { createCategory, updateUserNoLongerNew } from '../../actions';
import { useAppContext } from '../../context';
import { SETTINGS_MISSING_CATEGORY } from '../../constants';

const ModalReminder = ({ userId, items, setItems, newUser }) => {
  const { setShowModal, setShowToast } = useAppContext();

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

  useEffect(() => {
    if (!errorMessage.type) return;
    setErrorMessage({ type: '' });
  }, [form.type]);

  // handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal();
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [form]);

  // state handlers
  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
      priority: items?.length + 1,
    });
  };

  const handleMandatoryDate = (e) => {
    setForm({ ...form, mandatoryDate: e.target.checked });
  };

  // create category
  const handleCreateCategory = async (formData) => {
    if (!form.type) {
      setErrorMessage({ type: SETTINGS_MISSING_CATEGORY });
      return;
    }

    setIsAwaitingSubmitResponse(true);

    createCategory(formData).then((res) => {
      if (res.status === 200) {
        setItems((current) => [...current, res.item]);
        setForm({ userId, priority: '', type: '', mandatoryDate: false });
        if (newUser) updateUserNoLongerNew(userId);
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
  };

  return (
    <form action={handleCreateCategory}>
      <FormTextField
        label='Category Name'
        subLabel='Sum it up in one or two words (e.g., School, Shopping, Work, Appointments, etc.)'
        type='text'
        id='category'
        name='type'
        value={form?.type}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.type}
      />
      <FormCheckboxField
        label='Date or Date & Time'
        subLabel='By default each item you create will be a simple one-liner. Check the box if this category requires dates or dates and times. This option allows you to add additional details as well.'
        id='categoryDateTimeCheckbox'
        name='mandatoryDate'
        checked={form?.mandatoryDate}
        onChangeHandler={handleMandatoryDate}
      />
      <input type='hidden' name='userId' value={form?.userId} />
      <input type='hidden' name='priority' value={form?.priority} />
      <div className='modal__modal-button-wrapper'>
        <button onClick={handleCloseModal} className='modal__cancel-button'>
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
