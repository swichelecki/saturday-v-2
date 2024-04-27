import { useState, useEffect, useRef } from 'react';
import { useAppContext } from 'context';
import { RemindersItem } from 'components';
import { getReminder, updateReminder } from '../services';
import { useInnerWidth } from '../hooks';
import { handleHiddenHeight } from 'utilities';
import moment from 'moment-timezone';
import { MOBILE_BREAKPOINT } from '../constants';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const Reminders = ({ reminders }) => {
  const { setShowToast, setServerError } = useAppContext();

  const width = useInnerWidth();

  const remindersWrapperRef = useRef(null);
  const remindersCarouselRef = useRef(null);

  const [remindersItems, setReminders] = useState(reminders ?? []);
  const [reminderToUpdate, setReminderToUpdate] = useState({});
  const [showReminders, setShowReminders] = useState(true);
  const [isAwaitingResetResponse, setIsAwaitingResetResponse] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  // handle display of scroll buttons
  useEffect(() => {
    const handleResize = () => {
      remindersCarouselRef?.current?.scrollWidth >
      remindersWrapperRef?.current?.offsetWidth
        ? setShowScrollButtons(true)
        : setShowScrollButtons(false);
    };

    if (width && window && typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize());
      return () => window.removeEventListener('resize', handleResize());
    }
  }, [width]);

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

  const handleScrollNext = () => {
    // TODO
    // get reminders
    // get reminder with getBoundingClientRect().right that is > remindersWrapperRef getBoundingClientRect().right
    // find out how much of that remidner is getting cut off
    // move carousel that distance plus a bit more to show next reminder
    // if no next reminder just move that much
    /* console.log(
      'remindersWrapperRef width ',
      remindersWrapperRef.current.offsetWidth
    );
    console.log(
      'remindersCarouselRef width ',
      remindersCarouselRef.current.scrollWidth
    );
    remindersCarouselRef.current.style.overflow = 'visible';
    remindersCarouselRef.current.style.transition = `transform 300ms ease-out`;
    remindersCarouselRef.current.style.transform = `translateX(-146px)`; */
  };

  const handleScrollPrevious = () => {
    /* 
    TODO
    remindersCarouselRef.current.style.overflow = 'visible';
    remindersCarouselRef.current.style.transition = `transform 300ms ease-out`;
    remindersCarouselRef.current.style.transform = `translateX(146px)`; */
  };

  if (!remindersItems?.length) return <></>;

  return (
    <div className='reminders__outer-wrapper'>
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
              ? {
                  height: `${handleHiddenHeight(
                    remindersWrapperRef.current
                  )}px`,
                }
              : { height: '0px' }
          }
        >
          <div
            className='reminders__reminders-carousel'
            ref={remindersCarouselRef}
          >
            {remindersItems?.map((item, index) => (
              <RemindersItem
                key={`reminder-item__${index}`}
                id={item?._id}
                title={item?.reminder}
                date={
                  item?.exactRecurringDate &&
                  moment(item?.reminderDate.split('T')[0]).format(
                    'dddd, MMMM D'
                  )
                }
                isAwaitingResetResponse={isAwaitingResetResponse}
                handleResetReminder={handleResetReminder}
              />
            ))}
          </div>
        </div>
      </div>
      {showScrollButtons &&
        showReminders &&
        width &&
        width > MOBILE_BREAKPOINT && (
          <div className='reminders__scroll-buttons-wrapper'>
            <button
              onClick={handleScrollPrevious}
              className='reminders__reminders-scroll-button'
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={handleScrollNext}
              className='reminders__reminders-scroll-button'
            >
              <FaChevronRight />
            </button>
          </div>
        )}
    </div>
  );
};

export default Reminders;
