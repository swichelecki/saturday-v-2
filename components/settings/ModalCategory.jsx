'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { FormTextField, FormCheckboxField, Toast } from '../../components';
import { createCategory, updateUserNoLongerNew } from '../../actions';
import { useAppContext } from '../../context';
import {
  SETTINGS_MISSING_CATEGORY,
  FORM_CHARACTER_LIMIT_16,
} from '../../constants';

const ModalReminder = ({ userId, items, setItems, newUser }) => {
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

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  const handleMandatoryDate = (e) => {
    setForm({ ...form, mandatoryDate: e.target.checked });
  };

  const categorySchema = z.object({
    type: z
      .string()
      .min(1, SETTINGS_MISSING_CATEGORY)
      .max(16, FORM_CHARACTER_LIMIT_16),
  });

  // create category
  const handleCreateCategory = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const categorySchemaValidated = categorySchema.safeParse({
      type: formData.get('type'),
    });

    const { success, error } = categorySchemaValidated;

    if (!success) {
      const { type } = error.flatten().fieldErrors;
      setErrorMessage({ type: type?.[0] });
    } else {
      setIsAwaitingSubmitResponse(true);

      createCategory(formData).then((res) => {
        if (res.status === 200) {
          setItems((current) => [...current, res.item]);
          setForm({ userId, priority: '', type: '', mandatoryDate: false });
          // handle new user
          if (newUser) {
            updateUserNoLongerNew(userId).then((response) => {
              if (response.status === 200) {
                setIsDashboardPrompt(true);
              } else {
                setShowToast(<Toast serverError={response} />);
              }
            });
          }
        }

        if (res.status !== 200) {
          setShowToast(<Toast serverError={res} />);
        }

        setIsAwaitingSubmitResponse(false);
        handleCloseModal();
      });
    }
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
    <form onSubmit={handleCreateCategory}>
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

export default ModalReminder;
