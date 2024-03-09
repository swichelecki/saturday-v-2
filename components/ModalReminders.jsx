import { useState, useEffect, useRef } from 'react';
import { FormTextField, FormCheckboxField, FormSelectField } from 'components';
import { createReminder, updateReminder } from '../services';
import { handleSortItemsAscending } from 'utilities';
import {
  FORM_REMINDER_INTERVAL_OPTIONS,
  FORM_REMINDER_BUFFER_OPTIONS,
  FORM_ERROR_MISSING_REMINDER_TITLE,
  FORM_ERROR_MISSING_REMINDER_DATE,
  FORM_ERROR_MISSING_REMINDER_INTERVAL,
  FORM_ERROR_MISSING_REMINDER_BUFFER,
  MODAL_OPERATION_CREATE,
  MODAL_OPERATION_UPDATE,
} from 'constants';

const ModalReminder = ({
  userId,
  items,
  setItems,
  itemToUpdate,
  itemToEditId,
  setOpenCloseModal,
  modalRef,
  modalOperation,
}) => {
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
      left: 0,
      behavior: 'smooth',
    });
    setScrollToErrorMessage(false);
  }, [scrollToErrorMessage]);

  // handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal();
      if (e.key === 'Enter') handleSubmitRemidner();
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

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
  const handleCreateReminder = () => {
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
      setIsAwaitingSubmitResponse(false);
      setScrollToErrorMessage(true);
      return;
    }

    createReminder(form).then((res) => {
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
        setServerError(res.status);
        setShowToast(true);
      }

      setIsAwaitingSubmitResponse(false);
      handleCloseModal();
    });
  };

  // update reminder
  const handleUpdateReminder = () => {
    updateReminder(form).then((res) => {
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
        setServerError(res.status);
        setShowToast(true);
      }

      setIsAwaitingSubmitResponse(false);
      handleCloseModal();
    });
  };

  const handleCloseModal = () => {
    modalRef.current.close();
    setOpenCloseModal(false);
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

  const handleIntervalFormat = (interval) => {
    let intervalFormatted = '';
    switch (interval) {
      case 0:
        intervalFormatted = '';
        break;
      case 1:
        intervalFormatted = 'Monthly';
        break;
      case 2:
        intervalFormatted = 'Every Two Months';
        break;
      case 3:
        intervalFormatted = 'Every Three Months';
        break;
      case 4:
        intervalFormatted = 'Every Four Months';
        break;
      case 5:
        intervalFormatted = 'Every Five Months';
        break;
      case 6:
        intervalFormatted = 'Every Six Months';
        break;
      case 7:
        intervalFormatted = 'Every Seven Months';
        break;
      case 8:
        intervalFormatted = 'Every Eight Months';
        break;
      case 9:
        intervalFormatted = 'Every Nine Months';
        break;
      case 10:
        intervalFormatted = 'Every 10 Months';
        break;
      case 11:
        intervalFormatted = 'Every 11 Months';
        break;
      case 12:
        intervalFormatted = 'Annually';
        break;
    }
    return intervalFormatted;
  };

  const handleReminderBufferFormat = (buffer) => {
    let bufferFormatted = '';
    switch (buffer) {
      case 0:
        bufferFormatted = '';
        break;
      case 1:
        bufferFormatted = 'One Week';
        break;
      case 2:
        bufferFormatted = 'Two Weeks';
        break;
      case 3:
        bufferFormatted = 'Three Weeks';
        break;
    }
    return bufferFormatted;
  };

  return (
    <div ref={pageRef}>
      <FormTextField
        label={'Reminder'}
        type={'text'}
        id={'reminder'}
        name={'reminder'}
        value={form?.reminder}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.reminder}
      />
      <FormTextField
        label={`${
          modalOperation === MODAL_OPERATION_CREATE
            ? 'First Recurring Date'
            : 'Next Recurring Date'
        }  `}
        type={'date'}
        id={'reminderDate'}
        name={'reminderDate'}
        value={form?.reminderDate}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.reminderDate}
      />
      <FormSelectField
        label={'Recurrence Interval'}
        id={'reminderRecurrenceInterval'}
        value={handleIntervalFormat(form?.recurrenceInterval)}
        onChangeHandler={handleFormSelectField}
        options={FORM_REMINDER_INTERVAL_OPTIONS}
        errorMessage={errorMessage.recurrenceInterval}
      />
      <FormCheckboxField
        label={'Happens on Specific Date'}
        id={'remindersWithExactRecurringDate'}
        checked={form?.exactRecurringDate}
        onChangeHandler={handleReminderWithExactRecurringDate}
      />
      <FormSelectField
        label={'Recurrence Buffer'}
        subLabel={
          'Dispaly reminder how many weeks in advance of remidner date:'
        }
        id={'reminderRecurrenceBuffer'}
        value={handleReminderBufferFormat(form?.recurrenceBuffer)}
        onChangeHandler={handleFormSelectField}
        options={FORM_REMINDER_BUFFER_OPTIONS}
        errorMessage={errorMessage.recurrenceBuffer}
        disabled={!form?.exactRecurringDate}
      />
      <div className='modal__modal-button-wrapper'>
        <button onClick={handleCloseModal} className='modal__cancel-button'>
          Cancel
        </button>
        {modalOperation === MODAL_OPERATION_CREATE ? (
          <button
            className='modal__save-button'
            onClick={() => {
              setIsAwaitingSubmitResponse(true);
              handleCreateReminder();
            }}
          >
            {isAwaitingSubmitResponse && <div className='loader'></div>}
            Save
          </button>
        ) : (
          <button
            className='modal__update-button'
            onClick={() => {
              setIsAwaitingSubmitResponse(true);
              handleUpdateReminder();
            }}
          >
            {isAwaitingSubmitResponse && <div className='loader'></div>}
            Update
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalReminder;
