import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { submitTask, updateTask } from '../services';
import moment from 'moment-timezone';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { TYPE_UPCOMING } from 'constants';

const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const DetailsForm = ({ task }) => {
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

    if (
      !form?.title ||
      (type === TYPE_UPCOMING && !form?.date && !form?.dateAndTime) ||
      (type !== TYPE_UPCOMING && !form?.description)
    ) {
      // TODO: create user notifications
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
      ? updateTask(finalForm).then((res) => router.push('/'))
      : submitTask(finalForm).then((res) => {
          router.push('/');
        });
  };

  return (
    <form onSubmit={onSubmit} className='details-form'>
      <div className='details-form__form-row'>
        <label htmlFor='title'>Title</label>
        <input
          type='text'
          id='title'
          name='title'
          value={form?.title}
          onChange={handleSetForm}
        />
      </div>
      <div className='details-form__form-row'>
        <label htmlFor='description'>Description</label>
        <ReactQuill
          theme='snow'
          value={form?.description}
          onChange={handleSetQuill}
        />
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
      {(form?.type === TYPE_UPCOMING || type === TYPE_UPCOMING) && (
        <>
          <div className='details-form__form-row'>
            <label htmlFor='date'>Date</label>
            <input
              disabled={form?.dateAndTime}
              type='date'
              id='date'
              name='date'
              value={form?.date && !form?.dateAndTime ? form?.date : ''}
              onChange={handleSetForm}
            />
          </div>
          <div className='details-form__form-row'>
            <label htmlFor='dateAndTime'>Date & Time</label>
            <input
              disabled={form?.date && !form?.dateAndTime}
              type='datetime-local'
              id='dateAndTime'
              name='dateAndTime'
              value={form?.dateAndTime}
              onChange={handleSetForm}
            />
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
