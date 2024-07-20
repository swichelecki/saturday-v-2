'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  FORM_ERROR_MISSING_DATE,
} from '../constants';

const DetailsForm = ({ task, userId }) => {
  const formRef = useRef(null);

  const router = useRouter();

  const params = useSearchParams();
  const [priority, type, column, hasMandatoryDate] = params.values();

  const { setShowToast, setUserId } = useAppContext();

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
    dateOrDateAndTime: '',
  });
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [isAwaitingSaveResponse, setIsAwaitingSaveResponse] = useState(false);

  useEffect(() => {
    setUserId(userId);
  }, []);

  // remove error messages when adding data to fields
  useEffect(() => {
    if (!errorMessage.title) return;
    setErrorMessage({
      ...errorMessage,
      title: '',
    });
  }, [form.title]);

  useEffect(() => {
    if (!errorMessage.description) return;
    setErrorMessage({
      ...errorMessage,
      description: '',
    });
  }, [form.description]);

  useEffect(() => {
    if (!errorMessage.dateOrDateAndTime) return;
    setErrorMessage({
      ...errorMessage,
      dateOrDateAndTime: '',
    });
  }, [form.dateState, form.dateAndTime]);

  // scroll up to topmost error message
  useEffect(() => {
    if (!scrollToErrorMessage) return;
    const errorArray = Array.from(
      formRef.current.querySelectorAll('.form-field--error')
    );
    const firstErrorNode = errorArray[0];
    window.scrollTo({
      top: firstErrorNode.offsetTop - 24,
      left: 0,
      behavior: 'smooth',
    });
    setScrollToErrorMessage(false);
  }, [scrollToErrorMessage]);

  const handleSetForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleConfirmDeletion = (e) => {
    setForm({ ...form, confirmDeletion: e.target.checked });
  };

  const handleSetQuill = (value) => {
    setForm({ ...form, description: value });
  };

  const onSubmit = (formData) => {
    // error handling for missing required fields
    if (
      !form?.title ||
      (form.mandatoryDate && !form?.dateState && !form?.dateAndTimeState) ||
      (!form.mandatoryDate &&
        (!form?.description || form.description === '<p><br></p>'))
    ) {
      setErrorMessage({
        title: !form.title && FORM_ERROR_MISSING_TITLE,
        description:
          (!form.description || form.description === '<p><br></p>') &&
          !form.mandatoryDate &&
          FORM_ERROR_MISSING_DESCRIPTION,
        dateOrDateAndTime:
          form.mandatoryDate &&
          !form.dateState &&
          !form.dateAndTimeState &&
          FORM_ERROR_MISSING_DATE,
      });
      setScrollToErrorMessage(true);

      return;
    }

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
  };

  return (
    <form action={onSubmit} ref={formRef} className='form-page'>
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
            errorMessage={errorMessage.dateOrDateAndTime}
            disabled={form?.dateAndTimeState}
          />
          <FormTextField
            label='Date & Time'
            type='datetime-local'
            id='dateAndTime'
            name='dateAndTimeState'
            value={form?.dateAndTimeState}
            onChangeHandler={handleSetForm}
            errorMessage={errorMessage.dateOrDateAndTime}
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
          task?.dateAndTime
            ? task?.dateAndTime
            : handleDateAndTimeToUTC(form?.dateAndTimeState)
        }
      />
      <input
        type='hidden'
        name='date'
        value={task?.date ? task?.date : form?.dateState.split('T')[0]}
      />
      <div className='form-page__buttons-wrapper'>
        <button type='submit' className='form-page__save-button'>
          {isAwaitingSaveResponse && <div className='loader'></div>}
          Save
        </button>
        <Link href='/'>
          <span className='form-page__cancel-button'>Cancel</span>
        </Link>
      </div>
    </form>
  );
};

export default DetailsForm;
