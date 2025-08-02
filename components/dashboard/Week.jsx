'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context';
import { handleHiddenHeight, handleDateToYearMonthDay } from '../../utilities';
import { WeekItem, Toast } from '../../components';
import { useInnerWidth } from '../../hooks';
import moment from 'moment-timezone';
import { getCalendarItems } from '../../actions';
import { MOBILE_BREAKPOINT } from '../../constants';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const Week = ({ timezone, userId }) => {
  const { calendarItems, setCalendarItems } = useAppContext();

  const width = useInnerWidth();

  const weekWrapperRef = useRef(null);
  const weekCarouselRef = useRef(null);
  const carouselPositionRef = useRef(null);
  const animationIdRef = useRef(null);
  const isMovingXAxisRef = useRef(null);

  const [nextOrPrevMonday, setNextOrPrevMonday] = useState(null);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const [isAwaitingCalendarItems, setIsAwaitingCalendarItems] = useState(false);
  const [showWeek, setShowWeek] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [weekWrapperClientRectRight, setWeekWrapperClientRectRight] =
    useState(0);
  const [weekWrapperClientRectLeft, setWeekWrapperClientRectLeft] = useState(0);
  const [startXPosition, setStartXPosition] = useState(0);
  const [startYPosition, setStartYPosition] = useState(0);
  const [previousTranslateX, setPreviousTranslateX] = useState(0);

  const todayInUserTimezone = Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
  }).format(new Date());
  const today = handleDateToYearMonthDay(todayInUserTimezone);
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];

  // dynamically set carousel height when using show / hide button
  useEffect(() => {
    setCalendarHeight(handleHiddenHeight(weekWrapperRef?.current));
  }, [calendarItems, width, isAwaitingCalendarItems]);

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
  }, [width, isAwaitingCalendarItems]);

  // handle display of scroll buttons and carousel resize
  useEffect(() => {
    if (width <= MOBILE_BREAKPOINT) return;

    const setRefs = setTimeout(() => {
      weekCarouselRef?.current?.scrollWidth >
      weekWrapperRef?.current?.offsetWidth
        ? setShowScrollButtons(true)
        : setShowScrollButtons(false);

      setWeekWrapperClientRectRight(
        weekWrapperRef?.current?.getBoundingClientRect().right
      );
      setWeekWrapperClientRectLeft(
        weekWrapperRef?.current?.getBoundingClientRect().left
      );
    }, 50);

    if (weekCarouselRef.current && carouselPositionRef.current) {
      weekCarouselRef.current.style.transform = 'translateX(0)';
      weekCarouselRef.current.style.transition = 'transform 300ms ease-out';
      carouselPositionRef.current = 0;
    }

    return () => clearTimeout(setRefs);
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
      { passive: false }
    );

    return () => {
      weekCarouselRef?.current?.removeEventListener(
        'touchmove',
        (e) => handlePreventScroll(e),
        { passive: false }
      );
    };
  }, [calendarItems, isAwaitingCalendarItems]);

  // create array of days and calendar items when clicking next or previous week buttons
  useEffect(() => {
    if (!nextOrPrevMonday) return;

    setIsAwaitingCalendarItems(true);

    const nextOrPrevMondayDate = new Date(nextOrPrevMonday);
    const nextOrPrevMondayYearMonthDay =
      handleDateToYearMonthDay(nextOrPrevMondayDate);
    const sunday = nextOrPrevMondayDate.setDate(
      nextOrPrevMondayDate.getDate() + 6
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
            new Date(mondayCopy.setDate(mondayCopy.getDate() + 1))
          );
        }

        // create data shape for week component
        const calendarData = daysOfWeek.reduce((calendarDays, day) => {
          const yearMonthDay = handleDateToYearMonthDay(day);
          calendarDays.push({
            [yearMonthDay]: [
              ...res.calendarItems?.filter((calItem) => {
                const calItemDate = new Date(
                  calItem?.date ? calItem?.date : calItem?.reminderDate
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

      setIsAwaitingCalendarItems(false);
    });
  }, [nextOrPrevMonday]);

  const handleTouchStart = (e) => {
    if (width > MOBILE_BREAKPOINT) return;
    setStartXPosition(e.touches[0].clientX);
    setStartYPosition(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    // if touch move is up or down end touch move
    if (
      Math.max(
        e.touches[0].clientY - startYPosition,
        startYPosition - e.touches[0].clientY
      ) >
      Math.max(
        e.touches[0].clientX - startXPosition,
        startXPosition - e.touches[0].clientX
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
      Math.min(previousTranslateX + currentPosition - startXPosition, 0)
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

  const handleScrollNext = () => {
    const daysToShow = [];
    const days = weekWrapperRef.current.querySelectorAll('.week__calendar-day');
    days.forEach((item) => {
      if (item.getBoundingClientRect().right >= weekWrapperClientRectRight) {
        daysToShow.push(item);
      }
    });

    if (daysToShow.length === 0) return;

    const nextDayToShow = daysToShow[0];
    const nextDayToShowClientRectRight =
      nextDayToShow.getBoundingClientRect().right;

    carouselPositionRef.current +=
      nextDayToShowClientRectRight -
      weekWrapperClientRectRight +
      (daysToShow.length > 1 ? 32 : 8);

    weekCarouselRef.current.style.transform = `translateX(-${carouselPositionRef.current}px)`;
  };

  const handleScrollPrevious = () => {
    const daysToShow = [];
    const days = weekWrapperRef.current.querySelectorAll('.week__calendar-day');
    days.forEach((item) => {
      if (item.getBoundingClientRect().left <= weekWrapperClientRectLeft) {
        daysToShow.push(item);
      }
    });

    if (daysToShow.length === 0) return;

    const nextDayToShow = daysToShow[daysToShow.length - 1];
    const nextDayToShowClientRectLeft =
      nextDayToShow.getBoundingClientRect().left;

    carouselPositionRef.current +=
      nextDayToShowClientRectLeft -
      weekWrapperClientRectLeft -
      (daysToShow.length > 1 ? 32 : 8);

    weekCarouselRef.current.style.transform = `translateX(-${carouselPositionRef.current}px)`;
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
      getNextMonday(!nextOrPrevMonday ? new Date(today) : nextOrPrevMonday)
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
      getPrevMonday(!nextOrPrevMonday ? new Date(today) : nextOrPrevMonday)
    );
  };

  const showHideCalendar = () => {
    setShowWeek((current) => !current);
    weekWrapperRef.current.style.transition = 'height 0.3s';
  };

  if (!calendarItems?.length) return <></>;

  return (
    <div className='week__outer-wrapper'>
      <div className='week__wrapper'>
        <button
          className={`h2 ${!showWeek ? 'button-closed' : 'button-open'}`}
          onClick={showHideCalendar}
          type='button'
        >
          Week at a Glance
        </button>
        <div
          className='week__calendar-wrapper'
          ref={weekWrapperRef}
          style={
            showWeek
              ? {
                  height: `${calendarHeight}px`,
                }
              : { height: '0px' }
          }
        >
          <div className='week__calendar-month-year'>
            {moment(!nextOrPrevMonday ? today : nextOrPrevMonday).format(
              'MMM YYYY'
            )}
            <button
              onClick={handleGetPreviousWeek}
              className='carousel__button carousel__button--red'
              type='button'
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={handleGetNextWeek}
              className='carousel__button carousel__button--red'
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
            {isAwaitingCalendarItems ? (
              <div className='week__calendar-loading-wrapper'>
                <div className='loader'></div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
      {showScrollButtons && showWeek && width && width > MOBILE_BREAKPOINT && (
        <div className='carousel__buttons-wrapper'>
          <button
            onClick={handleScrollPrevious}
            className='carousel__button carousel__button--red'
            type='button'
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={handleScrollNext}
            className='carousel__button carousel__button--red'
            type='button'
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Week;
