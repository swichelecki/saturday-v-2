import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { submitTask, updateTask } from '../services';
import moment from 'moment-timezone';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const DetailsForm = ({ task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [dateAndTime, setDateAndTime] = useState('');

  useEffect(() => {
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setDate(task?.date ?? '');
    setDateAndTime(
      task?.dateAndTime
        ? moment(task?.dateAndTime)
            .tz('America/Chicago')
            .format('yyyy-MM-DDThh:mm')
        : ''
    );
  }, [task]);

  const [isAwaitingSaveResponse, setIsAwaitingSaveResponse] = useState(false);

  const router = useRouter();
  const { asPath } = router;

  const priority = parseInt(asPath.split('=')[1]);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!title && !date && !dateAndTime) {
      return;
    }

    let taskObject = {};

    if (date) {
      taskObject = {
        title,
        description,
        dateAndTime: null,
        date,
        priority,
      };
    }

    if (dateAndTime) {
      taskObject = {
        title,
        description,
        date: null,
        dateAndTime: new Date(dateAndTime).toISOString(),
        priority,
      };
    }

    setIsAwaitingSaveResponse(true);

    typeof asPath.split('/')[2] === 'string'
      ? updateTask(task?.id, taskObject).then((res) => router.push('/'))
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
          disabled={dateAndTime ? true : false}
          type='date'
          id='date'
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className='details-form__form-row'>
        <label htmlFor='dateAndTime'>Date & Time</label>
        <input
          disabled={date ? true : false}
          type='datetime-local'
          id='dateAndTime'
          value={dateAndTime}
          onChange={(e) => setDateAndTime(e.target.value)}
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
