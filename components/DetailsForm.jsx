'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '../context';
import { createItem, updateItem } from '../actions';
import { useScrollToError } from '../hooks';
import { handleDateAndTimeToUTC } from '../utilities';
import {
  FormTextField,
  FormWYSIWYGField,
  FormCheckboxField,
  FormErrorMessage,
  Toast,
} from '../components';
import { itemSchema } from '../schemas/schemas';

const DetailsForm = ({ task, user }) => {
  const formRef = useRef(null);
  const router = useRouter();
  const params = useSearchParams();
  const [priority, type, column, hasMandatoryDate] = params.values();
  const isUpdate = !!Object.keys(task ?? {}).length;
  const { userId, timezone, admin, numberOfItems } = user;
  const { setShowToast, setUserId, setIsAdmin } = useAppContext();

  const [form, setForm] = useState({
    _id: task?._id ?? '',
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

    if (e.target.name === 'dateAndTimeState') {
      setErrorMessage({ ...errorMessage, dateState: '' });
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
    const formData = new FormData(e.currentTarget);

    const itemSchemaValidated = itemSchema.safeParse({
      _id: formData.get('_id') ?? '',
      userId: formData.get('userId'),
      title: formData.get('title'),
      description: formData.get('description'),
      date: formData.get('date'),
      dateAndTime: formData.get('dateAndTime'),
      mandatoryDate: formData.get('mandatoryDate'),
      column: formData.get('column'),
      priority: formData.get('priority'),
      type: formData.get('type'),
      confirmDeletion: formData.get('confirmDeletion'),
      isDetailsForm: formData.get('isDetailsForm'),
      itemLimit: isUpdate ? numberOfItems - 1 : numberOfItems,
    });

    const { success, error } = itemSchemaValidated;
    if (!success) {
      const { title, description, date, itemLimit } =
        error.flatten().fieldErrors;

      if (!title && !description && !date && !itemLimit) {
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
        description: description?.[0],
        dateState: date?.[0],
        dateAndTimeState: date?.[0],
        itemLimit: itemLimit?.[0],
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingSaveResponse(true);
    isUpdate
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
              name='dateState'
              value={
                form?.dateState && !form?.dateAndTimeState
                  ? form?.dateState
                  : ''
              }
              onChangeHandler={handleSetForm}
              errorMessage={errorMessage.dateState}
              disabled={form?.dateAndTimeState}
              timezone={timezone}
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
              timezone={timezone}
            />
          </>
        )}
        <input type='hidden' name='_id' value={task?._id ?? ''} />
        <input type='hidden' name='userId' value={task?.userId ?? userId} />
        <input
          type='hidden'
          name='priority'
          value={task?.priority ?? priority}
        />
        <input type='hidden' name='type' value={task?.type ?? type} />
        <input type='hidden' name='column' value={task?.column ?? column} />
        <input
          type='hidden'
          name='mandatoryDate'
          value={task?.mandatoryDate ?? Boolean(hasMandatoryDate)}
        />
        <input type='hidden' name='description' value={form?.description} />
        <input type='hidden' name='isDetailsForm' value='true' />
        <input
          type='hidden'
          name='dateAndTime'
          value={
            form?.dateAndTimeState?.length > 0
              ? handleDateAndTimeToUTC(form?.dateAndTimeState)
              : ''
          }
        />
        <input
          type='hidden'
          name='date'
          value={
            form?.dateState?.length > 0
              ? form?.dateState.split('T')[0]
              : form?.dateAndTimeState?.length > 0
              ? form?.dateAndTimeState.split('T')[0]
              : ''
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
    </div>
  );
};

export default DetailsForm;
