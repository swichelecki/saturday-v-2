'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '../context';
import { createItem, updateItem } from '../actions';
import { handleDateAndTimeToUTC } from '../utilities';
import {
  FormTextField,
  FormWYSIWYGField,
  FormCheckboxField,
  Toast,
} from '../components';
import {
  FORM_ERROR_MISSING_TITLE,
  FORM_ERROR_MISSING_DESCRIPTION,
  FORM_ERROR_DATE_NOT_TODAY_OR_GREATER,
  FORM_ERROR_MISSING_DATE,
  FORM_CHARACTER_LIMIT_30,
  FORM_CHARACTER_LIMIT_500,
  TWENTYFOUR_HOURS,
} from '../constants';

const DetailsForm = ({ task, user }) => {
  const formRef = useRef(null);
  const router = useRouter();
  const params = useSearchParams();
  const [priority, type, column, hasMandatoryDate] = params.values();
  const { userId, timezone, admin } = user;
  const { setShowToast, setUserId, setTimezone, setIsAdmin } = useAppContext();

  const [form, setForm] = useState({
    _id: task?._id,
    userId: task?.userId ?? userId,
    title: task?.title ?? '',
    description: task?.description ?? '',
    confirmDeletion: task?.confirmDeletion ?? false,
    dateState: task?.date ?? '',
    dateAndTimeState: task?.dateAndTime ?? '',
    priority: task?.priority ?? priority,
    type: task?.type ?? type,
    column: task?.column ?? column,
    mandatoryDate: task?.mandatoryDate ?? Boolean(hasMandatoryDate),
  });
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    description: '',
    dateState: '',
    dateAndTimeState: '',
  });
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [isAwaitingSaveResponse, setIsAwaitingSaveResponse] = useState(false);

  useEffect(() => {
    // set global context user id and timezone
    setUserId(userId);
    setTimezone(timezone);
    setIsAdmin(admin);
  }, []);

  // scroll up to topmost error message
  useEffect(() => {
    if (!scrollToErrorMessage) return;
    const errorArray = Array.from(
      formRef.current.querySelectorAll('.form-field--error')
    );
    const firstErrorNode = errorArray[0];
    window.scrollTo({
      top: firstErrorNode.offsetTop - 24,
      behavior: 'smooth',
    });
    setScrollToErrorMessage(false);
  }, [scrollToErrorMessage]);

  const handleSetForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }

    if (e.target.name === 'dateAndTimeState') {
      setErrorMessage({ ...errorMessage, dateState: '' });
    }
  };

  const handleConfirmDeletion = (e) => {
    setForm({ ...form, confirmDeletion: e.target.checked });
  };

  const handleSetQuill = (value) => {
    setForm({ ...form, description: value });

    if (errorMessage.description) {
      setErrorMessage({ ...errorMessage, description: '' });
    }
  };

  const detailsFormSchema = z
    .object({
      title: z
        .string()
        .min(1, FORM_ERROR_MISSING_TITLE)
        .max(30, FORM_CHARACTER_LIMIT_30),
      description: z.string().max(500, FORM_CHARACTER_LIMIT_500),
      date: z.string(),
      dateAndTime: z.string(),
      mandatoryDate: z.boolean(),
    })
    .refine(
      (data) =>
        data.mandatoryDate ||
        (!data.mandatoryDate &&
          data.description?.length > 0 &&
          data.description !== '<p><br></p>'),
      {
        message: FORM_ERROR_MISSING_DESCRIPTION,
        path: ['description'],
      }
    )
    .refine(
      (data) =>
        (data.mandatoryDate && data.date?.length > 0) ||
        (data.mandatoryDate && data.dateAndTime?.length > 0) ||
        !data.mandatoryDate,
      {
        message: FORM_ERROR_MISSING_DATE,
        path: ['date'],
      }
    )
    .refine(
      (data) =>
        (data.mandatoryDate &&
          data.date?.length > 0 &&
          new Date(data.date).getTime() >= Date.now() - TWENTYFOUR_HOURS) ||
        (data.mandatoryDate &&
          data.dateAndTime?.length > 0 &&
          new Date(data.dateAndTime).getTime() >=
            Date.now() - TWENTYFOUR_HOURS) ||
        !data.mandatoryDate,
      {
        message: FORM_ERROR_DATE_NOT_TODAY_OR_GREATER,
        path: ['date'],
      }
    );

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const detailsFormSchemaValidated = detailsFormSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
      date: form.dateState,
      dateAndTime: form.dateAndTimeState,
      mandatoryDate: form.mandatoryDate,
    });

    const { success, error } = detailsFormSchemaValidated;

    if (!success) {
      const { title, description, date } = error.flatten().fieldErrors;
      setErrorMessage({
        title: title?.[0],
        description: description?.[0],
        dateState: date?.[0],
        dateAndTimeState: date?.[0],
      });
      setScrollToErrorMessage(true);
    } else {
      setIsAwaitingSaveResponse(true);

      priority == undefined
        ? updateItem(formData).then((res) => {
            if (res.status === 200) {
              router.push('/');
            }

            if (res.status !== 200) {
              setShowToast(<Toast serverError={res} />);
            }
          })
        : createItem(formData).then((res) => {
            if (res.status === 200) {
              router.push('/');
            }

            if (res.status !== 200) {
              setShowToast(<Toast serverError={res} />);
            }
          });
    }
  };

  return (
    <form onSubmit={onSubmit} ref={formRef} className='form-page'>
      <FormTextField
        label='Title'
        type='text'
        id='title'
        name='title'
        value={form?.title}
        onChangeHandler={handleSetForm}
        errorMessage={errorMessage.title}
      />
      <FormWYSIWYGField
        label='Description'
        value={form?.description}
        onChangeHandler={handleSetQuill}
        errorMessage={errorMessage.description}
      />
      <FormCheckboxField
        label='Confirm Deletion'
        name='confirmDeletion'
        checked={form?.confirmDeletion}
        onChangeHandler={handleConfirmDeletion}
      />
      {form?.mandatoryDate && (
        <>
          <FormTextField
            label='Date'
            type='date'
            id='date'
            name='dateState'
            value={
              form?.dateState && !form?.dateAndTimeState ? form?.dateState : ''
            }
            onChangeHandler={handleSetForm}
            errorMessage={errorMessage.dateState}
            disabled={form?.dateAndTimeState}
          />
          <FormTextField
            label='Date & Time'
            type='datetime-local'
            id='dateAndTime'
            name='dateAndTimeState'
            value={form?.dateAndTimeState}
            onChangeHandler={handleSetForm}
            errorMessage={errorMessage.dateState}
            disabled={form?.dateState && !form?.dateAndTimeState}
          />
        </>
      )}
      <input type='hidden' name='_id' value={task?._id} />
      <input type='hidden' name='userId' value={task?.userId ?? userId} />
      <input type='hidden' name='priority' value={task?.priority ?? priority} />
      <input type='hidden' name='type' value={task?.type ?? type} />
      <input type='hidden' name='column' value={task?.column ?? column} />
      <input
        type='hidden'
        name='mandatoryDate'
        value={task?.mandatoryDate ?? Boolean(hasMandatoryDate)}
      />
      <input type='hidden' name='description' value={form?.description} />
      <input
        type='hidden'
        name='dateAndTime'
        value={
          form?.dateAndTimeState
            ? handleDateAndTimeToUTC(form?.dateAndTimeState)
            : task?.dateAndTime
        }
      />
      <input
        type='hidden'
        name='date'
        value={
          form?.dateState
            ? form?.dateState.split('T')[0]
            : form?.dateAndTimeState
            ? form?.dateAndTimeState.split('T')[0]
            : task?.date
        }
      />
      <div className='form-page__buttons-wrapper'>
        <Link href='/'>
          <span className='form-page__cancel-button'>Cancel</span>
        </Link>
        <button type='submit' className='form-page__save-button'>
          {isAwaitingSaveResponse && <div className='loader'></div>}
          Save
        </button>
      </div>
    </form>
  );
};

export default DetailsForm;
