import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAppContext } from 'context';
import FormErrorMessage from './FormErrorMessage';
import { submitTask, updateTask } from '../services';
import moment from 'moment-timezone';
import 'react-quill/dist/quill.snow.css';
import {
  TYPE_UPCOMING,
  FORM_ERROR_MISSING_TITLE,
  FORM_ERROR_MISSING_DESCRIPTION,
  FORM_ERROR_MISSING_DATE,
} from 'constants';

const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const DetailsForm = ({ task }) => {
  const formRef = useRef(null);

  const { setShowToast, setServerError } = useAppContext();

  const [form, setForm] = useState({
    _id: task?._id,
    title: task?.title ?? '',
    description: task?.description ?? '',
    confirmDeletion: task?.confirmDeletion ?? false,
    date: task?.date?.split('T')[0] ?? '',
    dateAndTime: task?.dateAndTime
      ? moment(task?.dateAndTime)
          .tz('America/Chicago')
          .format('yyyy-MM-DDTHH:mm')
      : '',
    priority: task?.priority ?? '',
    type: task?.type ?? '',
  });
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    description: '',
    dateOrDateAndTime: '',
  });
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [isAwaitingSaveResponse, setIsAwaitingSaveResponse] = useState(false);

  const router = useRouter();
  const { priority, type } = router.query;

  // set state priority and type from query params when blank form
  useEffect(() => {
    if (!task) {
      setForm({
        ...form,
        priority,
        type,
      });
    }
  }, [priority, type]);

  // remove error messages when adding data to fields
  useEffect(() => {
    if (
      !errorMessage.title &&
      !errorMessage.description &&
      !errorMessage.dateOrDateAndTime
    )
      return;

    setErrorMessage({
      title: form.title ? '' : FORM_ERROR_MISSING_TITLE,
      description:
        type !== TYPE_UPCOMING && !form?.description
          ? FORM_ERROR_MISSING_DESCRIPTION
          : '',
      dateOrDateAndTime:
        type === TYPE_UPCOMING && (form.date || form.dateAndTime)
          ? ''
          : FORM_ERROR_MISSING_DATE,
    });
  }, [form]);

  // scroll up to topmost error message
  useEffect(() => {
    if (!scrollToErrorMessage) return;
    const errorArray = Array.from(
      formRef.current.querySelectorAll('.details-form__form-row--error')
    );
    const firstErrorNode = errorArray[0];
    window.scrollTo(0, firstErrorNode.offsetTop - 24);
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

  const onSubmit = (e) => {
    e.preventDefault();

    // error handling for missing required fields
    if (
      !form?.title ||
      (form.type === TYPE_UPCOMING && !form?.date && !form?.dateAndTime) ||
      (form.type !== TYPE_UPCOMING && !form?.description)
    ) {
      setErrorMessage({
        title: !form.title ? FORM_ERROR_MISSING_TITLE : '',
        description:
          !form.description && type !== TYPE_UPCOMING
            ? FORM_ERROR_MISSING_DESCRIPTION
            : '',
        dateOrDateAndTime:
          type === TYPE_UPCOMING && !form.date && !form.dateAndTime
            ? FORM_ERROR_MISSING_DATE
            : '',
      });
      setScrollToErrorMessage(true);

      return;
    }

    const formatDateAndTimeForMongoDB = (form) => {
      return {
        ...form,
        dateAndTime: new Date(form?.dateAndTime).toISOString(),
        date: form?.dateAndTime.split('T')[0],
      };
    };

    const finalForm = form?.dateAndTime
      ? formatDateAndTimeForMongoDB(form)
      : form;

    setIsAwaitingSaveResponse(true);

    priority == undefined
      ? updateTask(finalForm).then((res) => {
          if (res.status === 200) {
            router.push('/');
          }

          if (res.status !== 200) {
            setServerError(res.status);
            setShowToast(true);
            setIsAwaitingSaveResponse(false);
          }
        })
      : submitTask(finalForm).then((res) => {
          if (res.status === 200) {
            router.push('/');
          }

          if (res.status !== 200) {
            setServerError(res.status);
            setShowToast(true);
            setIsAwaitingSaveResponse(false);
          }
        });
  };

  return (
    <form onSubmit={onSubmit} ref={formRef} className='details-form'>
      <div
        className={`details-form__form-row${
          errorMessage.title ? ' details-form__form-row--error' : ''
        }`}
      >
        <label htmlFor='title'>Title</label>
        <input
          type='text'
          id='title'
          name='title'
          value={form?.title}
          onChange={handleSetForm}
        />
        {errorMessage.title && (
          <FormErrorMessage errorMessage={errorMessage.title} />
        )}
      </div>
      <div
        className={`details-form__form-row${
          errorMessage.description ? ' details-form__form-row--error' : ''
        }`}
      >
        <label htmlFor='description'>Description</label>
        <ReactQuill
          theme='snow'
          value={form?.description}
          onChange={handleSetQuill}
        />
        {errorMessage.description && (
          <FormErrorMessage errorMessage={errorMessage.description} />
        )}
      </div>
      <div className='details-form__form-row'>
        <label className='inputs__checkbox-container' htmlFor='checkbox'>
          <span>Confirm Deletion</span>
          <input
            type='checkbox'
            id='checkbox'
            checked={form?.confirmDeletion}
            onChange={handleConfirmDeletion}
          />
          <span className='inputs__checkbox'></span>
        </label>
      </div>
      {form?.type && form?.type === TYPE_UPCOMING && (
        <>
          <div
            className={`details-form__form-row${
              errorMessage.date || errorMessage.dateOrDateAndTime
                ? ' details-form__form-row--error'
                : ''
            }`}
          >
            <label htmlFor='date'>Date</label>
            <input
              disabled={form?.dateAndTime}
              type='date'
              id='date'
              name='date'
              value={form?.date && !form?.dateAndTime ? form?.date : ''}
              onChange={handleSetForm}
            />
            {errorMessage.dateOrDateAndTime && (
              <FormErrorMessage errorMessage={errorMessage.dateOrDateAndTime} />
            )}
          </div>
          <div
            className={`details-form__form-row${
              errorMessage.date || errorMessage.dateOrDateAndTime
                ? ' details-form__form-row--error'
                : ''
            }`}
          >
            <label htmlFor='dateAndTime'>Date & Time</label>
            <input
              disabled={form?.date && !form?.dateAndTime}
              type='datetime-local'
              id='dateAndTime'
              name='dateAndTime'
              value={form?.dateAndTime}
              onChange={handleSetForm}
            />
            {errorMessage.dateOrDateAndTime && (
              <FormErrorMessage errorMessage={errorMessage.dateOrDateAndTime} />
            )}
          </div>
        </>
      )}
      <div className='details-form__buttons-wrapper'>
        <button type='submit' className='details-form__save-button'>
          {isAwaitingSaveResponse && <div className='loader'></div>}
          Save
        </button>
        <Link href='/'>
          <span className='details-form__cancel-button'>Cancel</span>
        </Link>
      </div>
    </form>
  );
};

export default DetailsForm;
