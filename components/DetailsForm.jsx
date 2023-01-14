import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { submitTask, updateTask } from '../services';
import moment from 'moment-timezone';

const DetailsForm = ({ task }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [date, setDate] = useState(task?.date || '');
  const [dateAndTime, setDateAndTime] = useState(
    task?.dateAndTime
      ? moment(task?.dateAndTime)
          .tz('America/Chicago')
          .format('yyyy-MM-DDThh:mm')
      : ''
  );
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
        <textarea
          id='description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
