'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FormTextField,
  FormCheckboxField,
  FormSelectField,
  Toast,
} from '../../components';
import { createReminder, updateReminder } from '../../actions';
import { useAppContext } from '../../context';
import {
  handleSortItemsAscending,
  handleReminderBufferFormat,
  handleIntervalFormat,
} from '../../utilities';
import {
  FORM_REMINDER_INTERVAL_OPTIONS,
  FORM_REMINDER_BUFFER_OPTIONS,
  FORM_ERROR_MISSING_REMINDER_TITLE,
  FORM_ERROR_MISSING_REMINDER_DATE,
  FORM_ERROR_MISSING_REMINDER_INTERVAL,
  FORM_ERROR_MISSING_REMINDER_BUFFER,
  MODAL_OPERATION_CREATE,
  MODAL_OPERATION_UPDATE,
} from '../../constants';

const ModalReminder = ({
  userId,
  items,
  setItems,
  itemToUpdate,
  itemToEditId,
  modalOperation,
}) => {
  const { setShowModal, setShowToast } = useAppContext();

  const pageRef = useRef(null);

  const [form, setForm] = useState({
    userId,
    reminder: '',
    reminderDate: '',
    recurrenceInterval: 0,
    recurrenceBuffer: 0,
    exactRecurringDate: false,
    displayReminder: false,
  });
  const [errorMessage, setErrorMessage] = useState({
    reminder: '',
    reminderDate: '',
    recurrenceInterval: '',
    recurrenceBuffer: '',
  });
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
    useState(false);

  useEffect(() => {
    if (!errorMessage.reminder) return;
    setErrorMessage({ ...errorMessage, reminder: '' });
  }, [form.reminder]);

  useEffect(() => {
    if (!errorMessage.reminderDate) return;
    setErrorMessage({ ...errorMessage, reminderDate: '' });
  }, [form.reminderDate]);

  useEffect(() => {
    if (!errorMessage.recurrenceInterval) return;
    setErrorMessage({ ...errorMessage, recurrenceInterval: '' });
  }, [form.recurrenceInterval]);

  useEffect(() => {
    if (!errorMessage.recurrenceBuffer) return;
    setErrorMessage({ ...errorMessage, recurrenceBuffer: '' });
  }, [form.recurrenceBuffer]);

  // scroll up to topmost error message
  useEffect(() => {
    if (!scrollToErrorMessage) return;
    const errorArray = Array.from(
      pageRef.current.querySelectorAll('.form-field--error')
    );
    const firstErrorNode = errorArray[0];
    window.scrollTo({
      top: firstErrorNode.offsetTop - 24,
      behavior: 'smooth',
    });
    setScrollToErrorMessage(false);
  }, [scrollToErrorMessage]);

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

  // when edit button clicked, set state to item to update
  useEffect(() => {
    if (modalOperation === MODAL_OPERATION_UPDATE) {
      setForm(itemToUpdate);
    }
  }, [itemToUpdate]);

  // state handlers
  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleReminderWithExactRecurringDate = (e) => {
    setForm({
      ...form,
      exactRecurringDate: e.target.checked,
      recurrenceBuffer: '',
    });
  };

  const handleFormSelectField = (optionName, optionValue) => {
    setForm({ ...form, [optionName]: optionValue });
  };

  // add new reminder
  const handleCreateReminder = (formData) => {
    if (
      !form.reminder ||
      !form.reminderDate ||
      !form.recurrenceInterval ||
      (form.exactRecurringDate && !form.recurrenceBuffer)
    ) {
      setErrorMessage({
        ...errorMessage,
        reminder: !form.reminder && FORM_ERROR_MISSING_REMINDER_TITLE,
        reminderDate: !form.reminderDate && FORM_ERROR_MISSING_REMINDER_DATE,
        recurrenceInterval:
          !form.recurrenceInterval && FORM_ERROR_MISSING_REMINDER_INTERVAL,
        recurrenceBuffer:
          form.exactRecurringDate &&
          !form.recurrenceBuffer &&
          FORM_ERROR_MISSING_REMINDER_BUFFER,
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingSubmitResponse(true);
    createReminder(formData).then((res) => {
      if (res.status === 200) {
        const copyOfRemindersItems = [...items];
        setItems(
          handleSortItemsAscending(
            [...copyOfRemindersItems, res.item],
            'reminderDate'
          )
        );
        setForm({
          userId,
          reminder: '',
          reminderDate: '',
          recurrenceInterval: 0,
          recurrenceBuffer: 0,
          exactRecurringDate: false,
          displayReminder: false,
        });
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setIsAwaitingSubmitResponse(false);
      handleCloseModal();
    });
  };

  // update reminder
  const handleUpdateReminder = (formData) => {
    setIsAwaitingSubmitResponse(true);
    updateReminder(formData).then((res) => {
      if (res.status === 200) {
        setItems(
          handleSortItemsAscending(
            items?.map((item) => {
              if (item?._id === itemToEditId) {
                return res?.item;
              } else {
                return item;
              }
            }),
            'reminderDate'
          )
        );
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
      reminder: '',
      reminderDate: '',
      recurrenceInterval: 0,
      recurrenceBuffer: 0,
      exactRecurringDate: false,
      displayReminder: false,
    });
    setErrorMessage({
      reminder: '',
      reminderDate: '',
      recurrenceInterval: '',
      recurrenceBuffer: '',
    });
  };

  return (
    <form
      action={(formData) => {
        modalOperation === MODAL_OPERATION_CREATE
          ? handleCreateReminder(formData)
          : handleUpdateReminder(formData);
      }}
      ref={pageRef}
    >
      <FormTextField
        label='Reminder Name'
        subLabel={`${
          modalOperation === MODAL_OPERATION_CREATE
            ? 'Sum it up in a few words (e.g., Car Payment)'
            : ''
        }`}
        type='text'
        id='reminder'
        name='reminder'
        value={form?.reminder}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.reminder}
      />
      <FormTextField
        label={`${
          modalOperation === MODAL_OPERATION_CREATE
            ? 'First Recurrence Date'
            : 'Next Recurrence Date'
        }  `}
        subLabel={`${
          modalOperation === MODAL_OPERATION_CREATE
            ? 'Set the first date associated with this remidner'
            : ''
        }`}
        type='date'
        id='reminderDate'
        name='reminderDate'
        value={form?.reminderDate}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.reminderDate}
      />
      <FormSelectField
        label='Recurrence Interval'
        subLabel={`${
          modalOperation === MODAL_OPERATION_CREATE
            ? 'Set how often this reminder will reappear'
            : ''
        }`}
        id='reminderRecurrenceInterval'
        name='recurrenceInterval'
        value={handleIntervalFormat(form?.recurrenceInterval)}
        onChangeHandler={handleFormSelectField}
        options={FORM_REMINDER_INTERVAL_OPTIONS}
        errorMessage={errorMessage.recurrenceInterval}
      />
      <FormCheckboxField
        label='Show Date & Early Display'
        subLabel='Check the box if you want this reminder to appear before the next recurrence date. Set by how many weeks using the dropdown below. For example, when a birthday is coming up you may want the reminder to appear a week or two in advance.'
        id='remindersWithExactRecurringDate'
        name='exactRecurringDate'
        checked={form?.exactRecurringDate}
        onChangeHandler={handleReminderWithExactRecurringDate}
      />
      <FormSelectField
        label='Set Early Display'
        subLabel='Set how many weeks in advance this reminder will appear.'
        id='reminderRecurrenceBuffer'
        name='recurrenceBuffer'
        value={handleReminderBufferFormat(form?.recurrenceBuffer)}
        onChangeHandler={handleFormSelectField}
        options={FORM_REMINDER_BUFFER_OPTIONS}
        errorMessage={errorMessage.recurrenceBuffer}
        disabled={!form?.exactRecurringDate}
      />
      {modalOperation === MODAL_OPERATION_UPDATE && (
        <input type='hidden' name='_id' value={itemToEditId} />
      )}
      <input type='hidden' name='userId' value={userId} />
      <input type='hidden' name='displayReminder' value={false} />
      <div className='modal__modal-button-wrapper'>
        <button onClick={handleCloseModal} className='modal__cancel-button'>
          Cancel
        </button>
        {modalOperation === MODAL_OPERATION_CREATE ? (
          <button type='submit' className='modal__save-button'>
            {isAwaitingSubmitResponse && <div className='loader'></div>}
            Save
          </button>
        ) : (
          <button type='submit' className='modal__update-button'>
            {isAwaitingSubmitResponse && <div className='loader'></div>}
            Update
          </button>
        )}
      </div>
    </form>
  );
};

export default ModalReminder;
