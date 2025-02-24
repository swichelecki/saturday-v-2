'use client';

import moment from 'moment-timezone';
import { handleTodaysDateCheck } from '../../utilities';
import { ImCheckmark } from 'react-icons/im';

const RemindersItem = ({
  id,
  title,
  date,
  confirmDeletion,
  handleResetReminder,
}) => {
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
          className='reminders__reminders-button'
          onClick={() => {
            handleResetReminder(id, confirmDeletion);
          }}
        >
          <ImCheckmark />
        </button>
      )}
    </div>
  );
};

export default RemindersItem;
