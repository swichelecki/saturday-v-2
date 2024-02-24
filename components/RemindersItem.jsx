import { useState } from 'react';

const RemindersItem = ({
  id,
  title,
  date,
  isAwaitingResetResponse,
  handleResetReminder,
}) => {
  const [idToReset, setIdToReset] = useState('');

  return (
    <div className='reminders-item'>
      <p className='reminders-item__title'>{title}</p>
      {date && <p className='reminders-item__date'>{date}</p>}
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
