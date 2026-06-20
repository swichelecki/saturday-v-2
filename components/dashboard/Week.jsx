'use client';

import { useState, useEffect, useRef } from 'react';
import { handleDateToYearMonthDay } from '../../utilities';
import { WeekItem } from '../../components';
import dynamic from 'next/dynamic';
import { useInnerWidth } from '../../hooks';
import moment from 'moment-timezone';
import { getCalendarItems } from '../../actions';
import { MOBILE_BREAKPOINT } from '../../constants';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const Toast = dynamic(() => import('../../components/shared/Toast'), {
  ssr: false,
});

const Week = ({ timezone, userId, calendar }) => {
  const width = useInnerWidth();

  const weekWrapperRef = useRef(null);
  const weekCarouselRef = useRef(null);
  const carouselPositionRef = useRef(null);
  const animationIdRef = useRef(null);
  const isMovingXAxisRef = useRef(null);

  const [calendarItems, setCalendarItems] = useState(calendar);
  const [nextOrPrevMonday, setNextOrPrevMonday] = useState(null);
  const [startXPosition, setStartXPosition] = useState(0);
  const [startYPosition, setStartYPosition] = useState(0);
  const [previousTranslateX, setPreviousTranslateX] = useState(0);

  const todayInUserTimezone = Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
  }).format(new Date());
  const today = handleDateToYearMonthDay(todayInUserTimezone);
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];

  // sync with server data when calendar prop changes (e.g. after router.refresh())
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCalendarItems(calendar);
  }, [calendar]);

  // on mobile ensure current day of week is in view on page load
  useEffect(() => {
    if (!width || width > MOBILE_BREAKPOINT || typeof window === 'undefined')
      return;

    const todayCalendarItem = document.getElementById('today');
    if (!todayCalendarItem) return;
    const clientWidth = window.innerWidth;
    const todayCalendarItemWidth = todayCalendarItem.clientWidth;
    const todayCalendarItemClientRectLeft =
      todayCalendarItem.getBoundingClientRect().left;

    carouselPositionRef.current = todayCalendarItemClientRectLeft - 8;
    if (carouselPositionRef.current > clientWidth) {
      carouselPositionRef.current -= clientWidth - todayCalendarItemWidth - 16;
    }

    weekCarouselRef.current.style.transition = 'unset';
    weekCarouselRef.current.style.transform = `translateX(-${carouselPositionRef.current}px)`;

    setPreviousTranslateX(-carouselPositionRef.current);

    if (width > MOBILE_BREAKPOINT) {
      weekCarouselRef.current.style.transform = 'translateX(0)';
      weekCarouselRef.current.style.transition = 'transform 300ms ease-out';
      carouselPositionRef.current = 0;
    }
  }, [width]);

  // handle carousel resize
  useEffect(() => {
    if (width <= MOBILE_BREAKPOINT) return;

    if (weekCarouselRef.current && carouselPositionRef.current) {
      weekCarouselRef.current.style.transform = 'translateX(0)';
      weekCarouselRef.current.style.transition = 'transform 300ms ease-out';
      carouselPositionRef.current = 0;
    }
  }, [width]);

  // disable page scrolling when scrolling week carousel with touch events
  useEffect(() => {
    const handlePreventScroll = (e) => {
      if (e.cancelable && isMovingXAxisRef.current) {
        e.preventDefault();
      }
    };

    weekCarouselRef?.current?.addEventListener(
      'touchmove',
      (e) => handlePreventScroll(e),
      { passive: false },
    );

    return () => {
      weekCarouselRef?.current?.removeEventListener(
        'touchmove',
        (e) => handlePreventScroll(e),
        { passive: false },
      );
    };
  }, [calendarItems]);

  // create array of days and calendar items when clicking next or previous week buttons
  useEffect(() => {
    if (!nextOrPrevMonday) return;

    const nextOrPrevMondayDate = new Date(nextOrPrevMonday);
    const nextOrPrevMondayYearMonthDay =
      handleDateToYearMonthDay(nextOrPrevMondayDate);
    const sunday = nextOrPrevMondayDate.setDate(
      nextOrPrevMondayDate.getDate() + 6,
    );
    const nextOrPrevSundayYearMonthDay = handleDateToYearMonthDay(sunday);

    getCalendarItems({
      nextOrPrevMondayYearMonthDay,
      nextOrPrevSundayYearMonthDay,
      userId,
    }).then((res) => {
      if (res.status === 200) {
        // create array of all days of the week
        const daysOfWeek = [];
        daysOfWeek.push(nextOrPrevMonday);
        const mondayCopy = new Date(nextOrPrevMonday);
        for (let i = 1; i <= 6; i++) {
          daysOfWeek.push(
            new Date(mondayCopy.setDate(mondayCopy.getDate() + 1)),
          );
        }

        // create data shape for week component
        const calendarData = daysOfWeek.reduce((calendarDays, day) => {
          const yearMonthDay = handleDateToYearMonthDay(day);
          calendarDays.push({
            [yearMonthDay]: [
              ...res.calendarItems?.filter((calItem) => {
                const calItemDate = new Date(
                  calItem?.date ? calItem?.date : calItem?.reminderDate,
                );
                const calItemYearMonthDay = calItemDate
                  .toISOString()
                  .split('T')[0];
                if (calItemYearMonthDay === yearMonthDay) return calItem;
              }),
            ],
          });

          return calendarDays;
        }, []);

        weekWrapperRef.current.style.transition = 'unset';
        weekCarouselRef.current.style.transform = 'translateX(0px)';
        setPreviousTranslateX(0);

        setCalendarItems(calendarData);
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }
    });
  }, [nextOrPrevMonday]);

  const handleTouchStart = (e) => {
    setStartXPosition(e.touches[0].clientX);
    setStartYPosition(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    // if touch move is up or down end touch move
    if (
      Math.max(
        e.touches[0].clientY - startYPosition,
        startYPosition - e.touches[0].clientY,
      ) >
      Math.max(
        e.touches[0].clientX - startXPosition,
        startXPosition - e.touches[0].clientX,
      )
    )
      return;

    isMovingXAxisRef.current = true;

    const carouselScrollWidth = weekCarouselRef?.current?.scrollWidth;
    const currentPosition = e.touches[0].clientX;
    const clientWidth = window.innerWidth;
    const maxScrollWidth = -Math.abs(carouselScrollWidth - clientWidth + 8);

    carouselPositionRef.current = Math.max(
      maxScrollWidth,
      Math.min(previousTranslateX + currentPosition - startXPosition, 0),
    );

    animationIdRef.current = requestAnimationFrame(animation);
  };

  const animation = () => {
    weekCarouselRef.current.style.transform = `translateX(${carouselPositionRef.current}px)`;
    cancelAnimationFrame(animationIdRef.current);
  };

  const handleTouchEnd = () => {
    if (previousTranslateX === -carouselPositionRef.current) return;
    isMovingXAxisRef.current = false;
    setPreviousTranslateX(carouselPositionRef.current);
  };

  // show next week on button click
  const handleGetNextWeek = () => {
    const getNextMonday = (today) => {
      const dayOfWeek = today.getDay() - 1;
      const mondayDayOfMonth = today.getDate() - dayOfWeek;
      let mondayDate = today.setDate(mondayDayOfMonth);
      mondayDate = new Date(mondayDate);
      const nextMonday = mondayDate.setDate(mondayDate.getDate() + 7);
      return new Date(nextMonday);
    };

    setNextOrPrevMonday(
      getNextMonday(!nextOrPrevMonday ? new Date(today) : nextOrPrevMonday),
    );
  };

  // show previous week on button click
  const handleGetPreviousWeek = () => {
    const getPrevMonday = (today) => {
      const dayOfWeek = today.getDay() - 1;
      const mondayDayOfMonth = today.getDate() - dayOfWeek;
      let mondayDate = today.setDate(mondayDayOfMonth);
      mondayDate = new Date(mondayDate);
      const nextMonday = mondayDate.setDate(mondayDate.getDate() - 7);
      return new Date(nextMonday);
    };

    setNextOrPrevMonday(
      getPrevMonday(!nextOrPrevMonday ? new Date(today) : nextOrPrevMonday),
    );
  };

  if (!calendarItems || !calendarItems?.length) return <></>;

  return (
    <div className='week__outer-wrapper'>
      <div className='week__wrapper'>
        <h2>Week at a Glance</h2>
        <div className='week__calendar-wrapper' ref={weekWrapperRef}>
          <div className='week__calendar-month-year'>
            {moment(!nextOrPrevMonday ? today : nextOrPrevMonday).format(
              'MMM YYYY',
            )}
            <button
              onClick={handleGetPreviousWeek}
              className='carousel__button'
              type='button'
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={handleGetNextWeek}
              className='carousel__button'
              type='button'
            >
              <FaChevronRight />
            </button>
          </div>
          <div
            className='week__calendar-carousel'
            ref={weekCarouselRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {calendarItems?.map((item, index) => (
              <div
                className={`week__calendar-day${
                  Object.keys(item)[0] < today
                    ? ' week__calendar-day--past'
                    : ''
                }`}
                key={`calendar-day__${index}`}
                {...(Object.keys(item)[0] === today ? { id: 'today' } : {})}
              >
                <p className='week__day-of-week'>{daysOfWeek[index]}</p>
                <p
                  className={`week__day-of-month${
                    Object.keys(item)[0] === today &&
                    moment(Object.keys(item)[0]).format('D') !== '1'
                      ? ' week__day-of-month--today'
                      : Object.keys(item)[0] === today &&
                          moment(Object.keys(item)[0]).format('D') === '1'
                        ? ' week__day-of-month--today-first-of-month'
                        : ''
                  }`}
                >
                  {moment(Object.keys(item)[0]).format('D') === '1'
                    ? moment(Object.keys(item)[0]).format('MMM D')
                    : moment(Object.keys(item)[0]).format('D')}
                </p>
                {Object.values(item)[0]?.map((item, index) => (
                  <WeekItem
                    key={`week-item__${index}`}
                    title={item?.title}
                    dateAndTime={item?.dateAndTime}
                    timezone={timezone}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Week;
