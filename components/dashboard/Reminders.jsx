'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context';
import { RemindersItem, Modal, ModalConfirm, Toast } from '../../components';
import { getReminder, updateReminder } from '../../actions';
import { useInnerWidth } from '../../hooks';
import {
  handleHiddenHeight,
  handleModalResetPageScrolling,
} from '../../utilities';
import {
  MOBILE_BREAKPOINT,
  BY_WEEK_INTERVALS,
  SKIP_TO_NEXT_REMINDER_THRESHOLD,
} from '../../constants';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const Reminders = ({ reminders }) => {
  const { setShowToast, userId, setShowModal } = useAppContext();

  const width = useInnerWidth();

  const remindersWrapperRef = useRef(null);
  const remindersCarouselRef = useRef(null);
  const carouselPositionRef = useRef(null);

  const [remindersItems, setReminders] = useState(reminders ?? []);
  const [reminderToUpdate, setReminderToUpdate] = useState({});
  const [showReminders, setShowReminders] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [remindersWrapperClientRectRight, setRemindersWrapperClientRectRight] =
    useState(0);
  const [remindersWrapperClientRectLeft, setRemindersWrapperClientRectLeft] =
    useState(0);

  // handle display of scroll buttons and carousel resize
  useEffect(() => {
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
  }, [width]);

  // set next reminder date
  useEffect(() => {
    if (Object.keys(reminderToUpdate).length > 0) {
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

      let nextDate = reminderStartingDate.toISOString();
      nextDate = nextDate.split('T')[0];

      copyOfReminderToUpdate = {
        ...copyOfReminderToUpdate,
        userId,
        displayReminder: false,
        reminderDate: nextDate,
        reminderSortDate: nextDate,
        itemLimit: reminders?.length,
      };

      updateReminder(copyOfReminderToUpdate).then((res) => {
        if (res.status === 200) {
          setReminders(
            remindersItems.filter((item) => item._id !== reminderToUpdate._id)
          );
        }

        if (res.status !== 200) {
          setShowToast(<Toast serverError={res} />);
        }

        setShowModal(null);
        handleModalResetPageScrolling();
      });
    }
  }, [reminderToUpdate]);

  // hide scroll buttons after resetting reminder if scrolling no longer required
  useEffect(() => {
    if (Object.keys(reminderToUpdate).length <= 0) return;

    if (
      remindersCarouselRef?.current?.scrollWidth <=
      remindersWrapperRef?.current?.offsetWidth
    ) {
      setShowScrollButtons(false);
      remindersCarouselRef.current.style.transform = 'translateX(0)';
      carouselPositionRef.current = 0;
    }
  }, [remindersItems]);

  // get reminder to update
  const handleResetReminder = (id, confirmUpdate) => {
    if (confirmUpdate) {
      setShowModal(
        <Modal showCloseButton={false}>
          <ModalConfirm
            handleConfirm={handleResetReminder}
            confirmId={id}
            confirmType='Done'
            className='cta-button--yellow'
          />
        </Modal>
      );
      return;
    }

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

    const secondReminderToShow = remindersToShow[1];
    const secondReminderToShowClientRectRight =
      secondReminderToShow?.getBoundingClientRect().right;

    if (
      nextReminderToShowClientRectRight - remindersWrapperClientRectRight <
        SKIP_TO_NEXT_REMINDER_THRESHOLD &&
      secondReminderToShow
    ) {
      carouselPositionRef.current +=
        secondReminderToShowClientRectRight -
        remindersWrapperClientRectRight +
        (remindersToShow.length > 1 ? 24 : 8);
    } else {
      carouselPositionRef.current +=
        nextReminderToShowClientRectRight -
        remindersWrapperClientRectRight +
        (remindersToShow.length > 1 ? 24 : 8);
    }

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

    const secondReminderToShow = remindersToShow[remindersToShow.length - 2];
    const secondReminderToShowClientRectLeft =
      secondReminderToShow?.getBoundingClientRect().left;

    if (
      nextReminderToShowClientRectLeft - remindersWrapperClientRectLeft <
        SKIP_TO_NEXT_REMINDER_THRESHOLD &&
      secondReminderToShow
    ) {
      carouselPositionRef.current +=
        secondReminderToShowClientRectLeft -
        remindersWrapperClientRectLeft -
        (remindersToShow.length > 1 ? 24 : 8);
    } else {
      carouselPositionRef.current +=
        nextReminderToShowClientRectLeft -
        remindersWrapperClientRectLeft -
        (remindersToShow.length > 1 ? 24 : 8);
    }

    remindersCarouselRef.current.style.overflow = 'visible';
    remindersCarouselRef.current.style.transform = `translateX(-${carouselPositionRef.current}px)`;
  };

  if (!remindersItems?.length) return <></>;

  return (
    <div className='reminders__outer-wrapper'>
      <div className='reminders__wrapper'>
        <button
          className={`h2 ${!showReminders ? 'button-closed' : 'button-open'}`}
          onClick={() => setShowReminders((current) => !current)}
          type='button'
        >
          Recurring Reminders
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
                title={item?.title}
                date={item?.exactRecurringDate && item?.reminderDate}
                confirmDeletion={item?.confirmDeletion}
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
          <div className='carousel__buttons-wrapper'>
            <button
              onClick={handleScrollPrevious}
              className='carousel__button carousel__button--yellow'
              type='button'
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={handleScrollNext}
              className='carousel__button carousel__button--yellow'
              type='button'
            >
              <FaChevronRight />
            </button>
          </div>
        )}
    </div>
  );
};

export default Reminders;
