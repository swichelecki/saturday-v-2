'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '../../context';
import { createItem, updateItem } from '../../actions';
import { useScrollToError } from '../../hooks';
import { handleDateAndTimeToUTC } from '../../utilities';
import {
  FormTextField,
  FormWYSIWYGField,
  FormCheckboxField,
  FormErrorMessage,
  Toast,
} from '..';
import { itemSchema } from '../../schemas/schemas';

const DetailsForm = ({ task, user }) => {
  const formRef = useRef(null);
  const router = useRouter();
  const params = useSearchParams();
  const [priority, type, column, hasMandatoryDate, categoryId] =
    params.values();
  const isUpdate = !!Object.keys(task ?? {}).length;
  const { userId, timezone, admin, numberOfItems } = user;
  const { setShowToast, setUserId, setIsAdmin } = useAppContext();

  const [form, setForm] = useState({
    _id: task?._id ?? '',
    userId: task?.userId ?? userId,
    categoryId: task?.categoryId ?? categoryId,
    title: task?.title ?? '',
    description: task?.description ?? '',
    confirmDeletion: task?.confirmDeletion ?? false,
    date: task?.date ?? '',
    dateAndTime: task?.dateAndTime ?? '',
    priority: task?.priority ?? parseInt(priority),
    type: task?.type ?? type,
    column: task?.column ?? parseInt(column),
    mandatoryDate: task?.mandatoryDate ?? Boolean(hasMandatoryDate),
    itemLimit: isUpdate ? numberOfItems - 1 : numberOfItems,
  });
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    description: '',
    date: '',
    dateAndTime: '',
    itemLimit: '',
  });
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [isAwaitingSaveResponse, setIsAwaitingSaveResponse] = useState(false);

  useScrollToError(formRef, scrollToErrorMessage, setScrollToErrorMessage);

  useEffect(() => {
    // set global context user id and timezone
    setUserId(userId);
    setIsAdmin(admin);
  }, []);

  const handleSetForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }

    if (e.target.name === 'dateAndTime') {
      setErrorMessage({ ...errorMessage, date: '' });
    }
  };

  const handleConfirmDeletion = (e) => {
    setForm({ ...form, confirmDeletion: e.target.checked });
  };

  const handleSetQuill = (value) => {
    if (value === '<p><br></p>') {
      setForm({ ...form, description: '' });
      return;
    }

    setForm({ ...form, description: value });

    if (errorMessage.description) {
      setErrorMessage({ ...errorMessage, description: '' });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const zodValidationResults = itemSchema.safeParse({
      ...form,
      dateAndTime: form?.dateAndTime
        ? handleDateAndTimeToUTC(form?.dateAndTime)
        : '',
      date:
        form?.date && !form?.dateAndTime
          ? form?.date
          : form?.dateAndTime?.split('T')[0],
      isDetailsForm: true,
    });
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { title, description, date, itemLimit } =
        error.flatten().fieldErrors;

      if (!title && !description && !date && !itemLimit) {
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
        description: description?.[0],
        date: date?.[0],
        dateAndTime: date?.[0],
        itemLimit: itemLimit?.[0],
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingSaveResponse(true);
    isUpdate
      ? updateItem(zodFormData).then((res) => {
          if (res.status === 200) {
            router.push('/');
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }
        })
      : createItem(zodFormData).then((res) => {
          if (res.status === 200) {
            router.push('/');
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }
        });
  };

  return (
    <div ref={formRef} className='content-container'>
      {errorMessage.itemLimit && (
        <FormErrorMessage
          errorMessage={errorMessage.itemLimit}
          className='form-error-message form-error-message--position-static form-field--error'
        />
      )}
      <form onSubmit={onSubmit} className='form-page'>
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
              name='date'
              value={form?.date && !form?.dateAndTime ? form?.date : ''}
              onChangeHandler={handleSetForm}
              errorMessage={errorMessage.date}
              disabled={form?.dateAndTime}
              timezone={timezone}
            />
            <FormTextField
              label='Date & Time'
              type='datetime-local'
              id='dateAndTime'
              name='dateAndTime'
              value={form?.dateAndTime}
              onChangeHandler={handleSetForm}
              errorMessage={errorMessage.date}
              disabled={form?.date && !form?.dateAndTime}
              timezone={timezone}
            />
          </>
        )}
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
    </div>
  );
};

export default DetailsForm;
