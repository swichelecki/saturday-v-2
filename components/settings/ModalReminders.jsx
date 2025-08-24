'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FormTextField,
  FormCheckboxField,
  FormSelectField,
  Toast,
  CTA,
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
    userId: itemToUpdate?.userId ?? userId,
    title: itemToUpdate?.title ?? '',
    reminderDate: itemToUpdate?.reminderDate?.split('T')[0] ?? '',
    recurrenceInterval: itemToUpdate?.recurrenceInterval ?? 0,
    reminderSortDate: itemToUpdate?.reminderSortDate ?? '',
    recurrenceBuffer: itemToUpdate?.recurrenceBuffer ?? 0,
    exactRecurringDate: itemToUpdate?.exactRecurringDate ?? false,
    displayReminder: itemToUpdate?.displayReminder ?? false,
    confirmDeletion: itemToUpdate?.confirmDeletion ?? true,
    itemLimit: isUpdate ? numberOfReminders - 1 : numberOfReminders,
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

  // set sort date to ensure that all reminders are sorted by the day they appear on the dashboard
  useEffect(() => {
    if (!form.reminderDate || form.reminderSortDateForState === 0) return;

    const reminderDateObj = new Date(form.reminderDate);
    const reminderDateObjMinusBuffer = new Date(
      reminderDateObj.setDate(reminderDateObj.getDate() - form.recurrenceBuffer)
    );
    const reminderSortDateForState = reminderDateObjMinusBuffer
      .toISOString()
      .split('T')[0];

    setForm((curr) => {
      return {
        ...curr,
        reminderSortDate: reminderSortDateForState,
      };
    });
  }, [form.reminderDate, form.recurrenceBuffer]);

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
      [e.target.name]: e.target.checked,
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

    const zodValidationResults = reminderSchema.safeParse(form);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const {
        title,
        reminderDate,
        reminderSortDate,
        recurrenceInterval,
        recurrenceBuffer,
        confirmDeletion,
      } = error.flatten().fieldErrors;

      if (
        !title &&
        !reminderDate &&
        !reminderSortDate &&
        !recurrenceInterval &&
        !recurrenceBuffer &&
        !confirmDeletion
      ) {
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
        reminderDate: reminderDate?.[0],
        reminderSortDate: reminderSortDate?.[0],
        recurrenceInterval: recurrenceInterval?.[0],
        recurrenceBuffer: recurrenceBuffer?.[0],
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingSubmitResponse(true);
    isUpdate
      ? updateReminder(zodFormData).then((res) => {
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
      : createReminder(zodFormData).then((res) => {
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
      <div className='modal__modal-button-wrapper'>
        <CTA
          text='Cancel'
          className='cta-button cta-button--medium cta-button--full cta-button--orange'
          ariaLabel='Close modal'
          handleClick={handleCloseModal}
        />
        <CTA
          text={!isUpdate ? 'Save' : 'Update'}
          btnType='submit'
          className={`cta-button cta-button--medium cta-button--full cta-button--${
            !isUpdate ? 'green' : 'blue'
          }`}
          ariaLabel={
            !isUpdate
              ? 'Save recurring reminder for dashboard'
              : 'Update recurring reminder for dashboard'
          }
          showSpinner={isAwaitingSubmitResponse}
        />
      </div>
    </form>
  );
};

export default ModalReminder;
