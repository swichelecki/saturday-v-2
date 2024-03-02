import { useState, useRef } from 'react';
import { RemindersItem } from 'components';
import { handleHiddenHeight } from 'utilities';
import moment from 'moment-timezone';

const Reminders = ({ reminders }) => {
  const remindersWrapperRef = useRef(null);

  const [remindersItems, setReminders] = useState(reminders ?? []);
  const [showReminders, setShowReminders] = useState(true);
  const [isAwaitingResetResponse, setIsAwaitingResetResponse] = useState(false);

  const handleResetReminder = (id) => {
    setIsAwaitingResetResponse(true);
    // TODO: add reset logic
  };

  return (
    <div className='reminders__wrapper'>
      <button
        className={`${!showReminders ? 'button-closed' : 'button-open'}`}
        onClick={() => {
          setShowReminders((current) => !current);
        }}
      >
        Reminders
      </button>
      <div
        className='reminders__reminders-wrapper'
        ref={remindersWrapperRef}
        style={
          showReminders
            ? { height: `${handleHiddenHeight(remindersWrapperRef.current)}px` }
            : { height: '0px' }
        }
      >
        <div className='reminders__reminders-carousel'>
          {remindersItems?.map((item, index) => (
            <RemindersItem
              key={`reminder-item__${index}`}
              id={item?._id}
              title={item?.reminder}
              date={
                item?.exactRecurringDate &&
                moment(item?.reminderDate.split('T')[0]).format('dddd, MMMM D')
              }
              isAwaitingResetResponse={isAwaitingResetResponse}
              handleResetReminder={handleResetReminder}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reminders;
