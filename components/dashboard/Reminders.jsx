'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context';
import { RemindersItem, Toast } from '../../components';
import { getReminder, updateReminder } from '../../actions';
import { useInnerWidth } from '../../hooks';
import { handleHiddenHeight } from '../../utilities';
import { MOBILE_BREAKPOINT, BY_WEEK_INTERVALS } from '../../constants';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const Reminders = ({ reminders }) => {
  const { setShowToast, userId } = useAppContext();

  const width = useInnerWidth();

  const remindersWrapperRef = useRef(null);
  const remindersCarouselRef = useRef(null);
  const carouselPositionRef = useRef(null);

  const [remindersItems, setReminders] = useState(reminders ?? []);
  const [reminderToUpdate, setReminderToUpdate] = useState({});
  const [showReminders, setShowReminders] = useState(true);
  const [isAwaitingResetResponse, setIsAwaitingResetResponse] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [remindersWrapperClientRectRight, setRemindersWrapperClientRectRight] =
    useState(0);
  const [remindersWrapperClientRectLeft, setRemindersWrapperClientRectLeft] =
    useState(0);

  // handle display of scroll buttons and carousel resize
  useEffect(() => {
    const handleResize = () => {
      remindersCarouselRef?.current?.scrollWidth >
      remindersWrapperRef?.current?.offsetWidth
        ? setShowScrollButtons(true)
        : setShowScrollButtons(false);

      setRemindersWrapperClientRectRight(
        remindersWrapperRef?.current?.getBoundingClientRect().right
      );
      setRemindersWrapperClientRectLeft(
        remindersWrapperRef?.current?.getBoundingClientRect().left
      );

      if (remindersCarouselRef.current && carouselPositionRef.current) {
        remindersCarouselRef.current.style.transform = 'translateX(0)';
        carouselPositionRef.current = 0;
      }
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
      const startingDate = copyOfReminderToUpdate?.reminderDate;
      const interval = copyOfReminderToUpdate?.recurrenceInterval;
      const reminderStartingDate = new Date(startingDate);

      if (BY_WEEK_INTERVALS.includes(interval)) {
        // set weekly reminder
        reminderStartingDate.setTime(reminderStartingDate.getTime() + interval);
      } else {
        // set monthly reminder
        reminderStartingDate.setMonth(
          reminderStartingDate.getMonth() + interval
        );
      }

      const nextDate = reminderStartingDate.toISOString();

      copyOfReminderToUpdate = {
        ...copyOfReminderToUpdate,
        userId,
        displayReminder: false,
        reminderDate: nextDate,
      };

      const formDataReminder = new FormData();
      for (let key in copyOfReminderToUpdate) {
        formDataReminder.append(key, copyOfReminderToUpdate[key]);
      }

      updateReminder(formDataReminder).then((res) => {
        if (res.status === 200) {
          setReminders(
            remindersItems.filter((item) => item._id !== reminderToUpdate._id)
          );
        }

        if (res.status !== 200) {
          setShowToast(<Toast serverError={res} />);
        }

        setIsAwaitingResetResponse(false);
      });
    }
  }, [reminderToUpdate]);

  // get reminder to update
  const handleResetReminder = (id) => {
    setIsAwaitingResetResponse(true);
    getReminder(userId, id).then((res) => {
      if (res.status === 200) {
        setReminderToUpdate(res.item);
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }
    });
  };

  // scroll carousel to next reminder
  const handleScrollNext = () => {
    const remindersToShow = [];
    const reminders =
      remindersWrapperRef.current.querySelectorAll('.reminders-item');
    reminders.forEach((item) => {
      if (
        item.getBoundingClientRect().right >= remindersWrapperClientRectRight
      ) {
        remindersToShow.push(item);
      }
    });

    if (remindersToShow.length === 0) return;

    const nextReminderToShow = remindersToShow[0];
    const nextReminderToShowClientRectRight =
      nextReminderToShow.getBoundingClientRect().right;

    carouselPositionRef.current +=
      nextReminderToShowClientRectRight -
      remindersWrapperClientRectRight +
      (remindersToShow.length > 1 ? 24 : 8);

    remindersCarouselRef.current.style.overflow = 'visible';
    remindersCarouselRef.current.style.transform = `translateX(-${carouselPositionRef.current}px)`;
  };

  // scroll carousel to previous reminder
  const handleScrollPrevious = () => {
    const remindersToShow = [];
    const reminders =
      remindersWrapperRef.current.querySelectorAll('.reminders-item');
    reminders.forEach((item) => {
      if (item.getBoundingClientRect().left <= remindersWrapperClientRectLeft) {
        remindersToShow.push(item);
      }
    });

    if (remindersToShow.length === 0) return;

    const nextReminderToShow = remindersToShow[remindersToShow.length - 1];
    const nextReminderToShowClientRectLeft =
      nextReminderToShow.getBoundingClientRect().left;

    carouselPositionRef.current +=
      nextReminderToShowClientRectLeft -
      remindersWrapperClientRectLeft -
      (remindersToShow.length > 1 ? 24 : 8);

    remindersCarouselRef.current.style.overflow = 'visible';
    remindersCarouselRef.current.style.transform = `translateX(-${carouselPositionRef.current}px)`;
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
                date={item?.exactRecurringDate && item?.reminderDate}
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
