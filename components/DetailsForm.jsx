import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppContext } from 'context';
import { submitTask, updateTask } from '../services';
import { FormTextField, FormWYSIWYGField, FormCheckboxField } from 'components';
import moment from 'moment-timezone';
import {
  TYPE_UPCOMING,
  FORM_ERROR_MISSING_TITLE,
  FORM_ERROR_MISSING_DESCRIPTION,
  FORM_ERROR_MISSING_DATE,
} from 'constants';

const DetailsForm = ({ task }) => {
  const formRef = useRef(null);

  const { userId, setShowToast, setServerError } = useAppContext();

  const [form, setForm] = useState({
    _id: task?._id,
    userId: task?.userId ?? '',
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

  // set priority, type and user id when blank form
  useEffect(() => {
    if (!task) {
      setForm({
        ...form,
        userId,
        priority,
        type,
      });
    }
  }, [userId, priority, type]);

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
  }, [form.date, form.dateAndTime]);

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

  const onSubmit = (e) => {
    e.preventDefault();

    // error handling for missing required fields
    if (
      !form?.title ||
      (form.type === TYPE_UPCOMING && !form?.date && !form?.dateAndTime) ||
      (form.type !== TYPE_UPCOMING &&
        (!form?.description || form.description === '<p><br></p>'))
    ) {
      setErrorMessage({
        title: !form.title && FORM_ERROR_MISSING_TITLE,
        description:
          (!form.description || form.description === '<p><br></p>') &&
          type !== TYPE_UPCOMING &&
          FORM_ERROR_MISSING_DESCRIPTION,
        dateOrDateAndTime:
          type === TYPE_UPCOMING &&
          !form.date &&
          !form.dateAndTime &&
          FORM_ERROR_MISSING_DATE,
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
    <form onSubmit={onSubmit} ref={formRef} className='form-page'>
      <FormTextField
        label={'Title'}
        type={'text'}
        id={'title'}
        name={'title'}
        value={form?.title}
        onChangeHandler={handleSetForm}
        errorMessage={errorMessage.title}
      />
      <FormWYSIWYGField
        label={'Description'}
        value={form?.description}
        onChangeHandler={handleSetQuill}
        errorMessage={errorMessage.description}
      />
      <FormCheckboxField
        label={'Confirm Deletion'}
        checked={form?.confirmDeletion}
        onChangeHandler={handleConfirmDeletion}
      />
      {form?.type && form?.type === TYPE_UPCOMING && (
        <>
          <FormTextField
            label={'Date'}
            type={'date'}
            id={'date'}
            name={'date'}
            value={form?.date && !form?.dateAndTime ? form?.date : ''}
            onChangeHandler={handleSetForm}
            errorMessage={errorMessage.dateOrDateAndTime}
            disabled={form?.dateAndTime}
          />
          <FormTextField
            label={'Date & Time'}
            type={'datetime-local'}
            id={'dateAndTime'}
            name={'dateAndTime'}
            value={form?.dateAndTime}
            onChangeHandler={handleSetForm}
            errorMessage={errorMessage.dateOrDateAndTime}
            disabled={form?.date && !form?.dateAndTime}
          />
        </>
      )}
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
