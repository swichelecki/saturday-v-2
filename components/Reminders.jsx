import { useState, useEffect, useRef } from 'react';
import { useAppContext } from 'context';
import { RemindersItem } from 'components';
import { getReminder, updateReminder } from '../services';
import { handleHiddenHeight } from 'utilities';
import moment from 'moment-timezone';

const Reminders = ({ reminders }) => {
  const { setShowToast, setServerError } = useAppContext();

  const remindersWrapperRef = useRef(null);

  const [remindersItems, setReminders] = useState(reminders ?? []);
  const [reminderToUpdate, setReminderToUpdate] = useState({});
  const [showReminders, setShowReminders] = useState(true);
  const [isAwaitingResetResponse, setIsAwaitingResetResponse] = useState(false);

  // set next reminder date
  useEffect(() => {
    if (isAwaitingResetResponse) {
      let copyOfReminderToUpdate = { ...reminderToUpdate };

      const today = new Date();
      const startingDate = copyOfReminderToUpdate?.reminderDate;
      const interval = copyOfReminderToUpdate?.recurrenceInterval;
      const date = new Date(startingDate);
      date.setMonth(today.getMonth() + interval);
      const nextDate = date.toISOString();

      copyOfReminderToUpdate = {
        ...copyOfReminderToUpdate,
        displayReminder: false,
        reminderDate: nextDate,
      };

      updateReminder(copyOfReminderToUpdate).then((res) => {
        if (res.status === 200) {
          setReminders(
            remindersItems.filter((item) => item._id !== reminderToUpdate._id)
          );
        }

        if (res.status !== 200) {
          setServerError(res.status);
          setShowToast(true);
        }

        setIsAwaitingResetResponse(false);
      });
    }
  }, [reminderToUpdate]);

  // get reminder to update
  const handleResetReminder = (id) => {
    setIsAwaitingResetResponse(true);
    getReminder(id).then((res) => {
      if (res.status === 200) {
        setReminderToUpdate(res.item);
      }

      if (res.status !== 200) {
        setServerError(res.status);
        setShowToast(true);
      }
    });
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
