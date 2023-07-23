import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { submitTask, updateTask } from '../services';
import moment from 'moment-timezone';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const DetailsForm = ({ task }) => {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [date, setDate] = useState(task?.date?.split('T')[0] ?? '');
  const [dateAndTime, setDateAndTime] = useState(
    task?.dateAndTime
      ? moment(task?.dateAndTime)
          .tz('America/Chicago')
          .format('yyyy-MM-DDTHH:mm')
      : ''
  );
  const [taskType, setTaskType] = useState(task?.type ?? '');
  const [isAwaitingSaveResponse, setIsAwaitingSaveResponse] = useState(false);

  const router = useRouter();
  const { itemPriority, type } = router.query;

  const priority = task ? task?.priority : itemPriority;

  useEffect(() => {
    if (!task) {
      setTaskType(type);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    if (
      !title ||
      (taskType === 'upcoming' && !date && !dateAndTime) ||
      (!task !== 'upcoming' && !description)
    ) {
      return;
    }

    let taskObject = {};

    if (date) {
      taskObject = {
        _id: task?._id,
        title,
        description,
        date: date,
        dateAndTime: null,
        priority,
        type,
      };
    }

    if (dateAndTime) {
      taskObject = {
        _id: task?._id,
        title,
        description,
        date: dateAndTime.split('T')[0],
        dateAndTime: new Date(dateAndTime).toISOString(),
        priority,
        type,
      };
    }

    if (!date && !dateAndTime && taskType !== 'upcoming') {
      taskObject = {
        _id: task?._id,
        title,
        description,
        date: null,
        dateAndTime: null,
        priority,
        type,
      };
    }

    setIsAwaitingSaveResponse(true);

    itemPriority == undefined
      ? updateTask(taskObject).then((res) => router.push('/'))
      : submitTask(taskObject).then((res) => {
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className='details-form__form-row'>
        <label htmlFor='description'>Description</label>
        <ReactQuill
          theme='snow'
          value={description}
          onChange={setDescription}
        />
      </div>
      <div className='details-form__form-row'>
        <label htmlFor='date'>Date</label>
        <input
          disabled={
            dateAndTime || (!dateAndTime && taskType !== 'upcoming')
              ? true
              : false
          }
          type='date'
          id='date'
          value={date && !dateAndTime ? date : ''}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className='details-form__form-row'>
        <label htmlFor='dateAndTime'>Date & Time</label>
        <input
          disabled={
            (date && !dateAndTime) ||
            (!date && !dateAndTime && taskType !== 'upcoming')
              ? true
              : false
          }
          type='datetime-local'
          id='dateAndTime'
          value={dateAndTime}
          onChange={(e) => {
            setDateAndTime(e.target.value);
            setDate('');
          }}
        />
      </div>
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
