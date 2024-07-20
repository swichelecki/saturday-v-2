'use client';

import { useState } from 'react';
import moment from 'moment-timezone';
import { handleTodaysDateCheck } from '../../utilities';

const RemindersItem = ({
  id,
  title,
  date,
  isAwaitingResetResponse,
  handleResetReminder,
}) => {
  const [idToReset, setIdToReset] = useState('');

  const isToday = date ? handleTodaysDateCheck(date.split('T')[0]) : false;

  return (
    <div className={`reminders-item${isToday ? ' reminders-item--today' : ''}`}>
      <p>
        {isToday && 'Today: '}
        {title}
      </p>
      {date && (
        <p className='reminders-item__date'>
          {moment(date.split('T')[0]).format('dddd, MMMM D')}
        </p>
      )}
      {!date && (
        <button
          className={`reminders__reminders-button${
            isAwaitingResetResponse && id === idToReset
              ? ' reminders__reminders-button--resetting'
              : ''
          }`}
          onClick={() => {
            setIdToReset(id);
            handleResetReminder(id);
          }}
        >
          {isAwaitingResetResponse && id === idToReset && (
            <div className='loader'></div>
          )}
        </button>
      )}
    </div>
  );
};

export default RemindersItem;
