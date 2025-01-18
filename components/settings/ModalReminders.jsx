'use client';

import { useState, useRef } from 'react';
import {
  FormTextField,
  FormCheckboxField,
  FormSelectField,
  Toast,
} from '../../components';
import { createReminder, updateReminder } from '../../actions';
import { useAppContext } from '../../context';
import { useScrollToError } from '../../hooks';
import {
  handleSortItemsAscending,
  handleModalResetPageScrolling,
} from '../../utilities';
import { reminderSchema } from '../../schemas/schemas';
import {
  FORM_REMINDER_INTERVAL_OPTIONS,
  FORM_REMINDER_BUFFER_OPTIONS,
} from '../../constants';

const ModalReminder = ({
  userId,
  items,
  setItems,
  itemToUpdate,
  numberOfReminders,
}) => {
  const { setShowModal, setShowToast } = useAppContext();

  const pageRef = useRef(null);

  const isUpdate = !!Object.keys(itemToUpdate ?? {}).length;

  const [form, setForm] = useState({
    _id: itemToUpdate?._id ?? '',
    userId: itemToUpdate?.userId ?? '',
    title: itemToUpdate?.title ?? '',
    reminderDate: itemToUpdate?.reminderDate ?? '',
    recurrenceInterval: itemToUpdate?.recurrenceInterval ?? 0,
    recurrenceBuffer: itemToUpdate?.recurrenceBuffer ?? 0,
    exactRecurringDate: itemToUpdate?.exactRecurringDate ?? false,
    displayReminder: itemToUpdate?.displayReminder ?? false,
    confirmDeletion: itemToUpdate?.confirmDeletion ?? true,
  });
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    reminderDate: '',
    recurrenceInterval: '',
    recurrenceBuffer: '',
  });
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
    useState(false);

  useScrollToError(pageRef, scrollToErrorMessage, setScrollToErrorMessage);

  // state handlers
  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  const handleReminderWithExactRecurringDate = (e) => {
    setForm({
      ...form,
      exactRecurringDate: e.target.checked,
      recurrenceBuffer: 0,
    });

    if (errorMessage.recurrenceBuffer) {
      setErrorMessage({ ...errorMessage, recurrenceBuffer: '' });
    }
  };

  const handleFormSelectField = (optionName, optionValue) => {
    setForm({ ...form, [optionName]: parseInt(optionValue) });

    if (errorMessage[optionName]) {
      setErrorMessage({ ...errorMessage, [optionName]: '' });
    }
  };

  // create or update
  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const reminderSchemaValidated = reminderSchema.safeParse({
      _id: formData.get('_id'),
      userId: formData.get('userId'),
      title: formData.get('title'),
      reminderDate: formData.get('reminderDate'),
      recurrenceInterval: formData.get('recurrenceInterval'),
      exactRecurringDate: formData.get('exactRecurringDate'),
      recurrenceBuffer: formData.get('recurrenceBuffer'),
      displayReminder: formData.get('displayReminder'),
      confirmDeletion: formData.get('confirmDeletion'),
      itemLimit: isUpdate ? numberOfReminders - 1 : numberOfReminders,
    });

    const { success, error } = reminderSchemaValidated;
    if (!success) {
      const {
        title,
        reminderDate,
        recurrenceInterval,
        recurrenceBuffer,
        confirmDeletion,
      } = error.flatten().fieldErrors;

      if (
        !title &&
        !reminderDate &&
        !recurrenceInterval &&
        !recurrenceBuffer &&
        !confirmDeletion
      ) {
        const serverError = {
          status: 400,
          error: 'Invalid FormData. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage({
        title: title?.[0],
        reminderDate: reminderDate?.[0],
        recurrenceInterval: recurrenceInterval?.[0],
        recurrenceBuffer: recurrenceBuffer?.[0],
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingSubmitResponse(true);
    isUpdate
      ? updateReminder(formData).then((res) => {
          if (res.status === 200) {
            setItems(
              handleSortItemsAscending(
                items?.map((item) => {
                  if (item?._id === itemToUpdate?._id) {
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

          handleCloseModal();
        })
      : createReminder(formData).then((res) => {
          if (res.status === 200) {
            const copyOfRemindersItems = [...items];
            setItems(
              handleSortItemsAscending(
                [...copyOfRemindersItems, res.item],
                'reminderDate'
              )
            );
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }

          handleCloseModal();
        });
  };

  const handleCloseModal = () => {
    setIsAwaitingSubmitResponse(false);
    setShowModal(null);
    setForm({
      _id: '',
      userId,
      title: '',
      reminderDate: '',
      recurrenceInterval: 0,
      recurrenceBuffer: 0,
      exactRecurringDate: false,
      displayReminder: false,
      confirmDeletion: true,
    });
    setErrorMessage({
      title: '',
      reminderDate: '',
      recurrenceInterval: '',
      recurrenceBuffer: '',
    });
    handleModalResetPageScrolling();
  };

  return (
    <form onSubmit={onSubmit} ref={pageRef}>
      <FormTextField
        label='Reminder Name'
        subLabel={`${
          !isUpdate
            ? 'Sum it up succinctly (e.g., Car Payment, Mom’s Birthday, etc.)'
            : ''
        }`}
        type='text'
        id='title'
        name='title'
        value={form?.title}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.title}
      />
      <FormTextField
        label={`${
          !isUpdate ? 'First Recurrence Date' : 'Next Recurrence Date'
        }  `}
        subLabel={`${
          !isUpdate ? 'Set the first date associated with this remidner' : ''
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
          !isUpdate ? 'Set how often this reminder will reappear' : ''
        }`}
        id='reminderRecurrenceInterval'
        name='recurrenceInterval'
        value={form?.recurrenceInterval}
        onChangeHandler={handleFormSelectField}
        options={FORM_REMINDER_INTERVAL_OPTIONS}
        errorMessage={errorMessage.recurrenceInterval}
      />
      <FormCheckboxField
        label='Early Display & Show Date'
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
        value={form?.recurrenceBuffer}
        onChangeHandler={handleFormSelectField}
        options={FORM_REMINDER_BUFFER_OPTIONS}
        errorMessage={errorMessage.recurrenceBuffer}
        disabled={!form?.exactRecurringDate}
      />
      <input type='hidden' name='_id' value={itemToUpdate?._id ?? ''} />
      <input type='hidden' name='userId' value={userId} />
      <input
        type='hidden'
        name='displayReminder'
        value={form?.displayReminder}
      />
      <input type='hidden' name='confirmDeletion' value='true' />
      <div className='modal__modal-button-wrapper'>
        <button
          onClick={handleCloseModal}
          type='button'
          className='modal__cancel-button'
        >
          Cancel
        </button>
        {!isUpdate ? (
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
