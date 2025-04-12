'use client';

import { useState, useEffect, useRef } from 'react';
import { handleHiddenHeight } from '../../utilities';
import { WeekItem } from '../../components';
import { useInnerWidth } from '../../hooks';
import moment from 'moment-timezone';
import { MOBILE_BREAKPOINT } from '../../constants';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const Week = ({ calendarItems, timezone }) => {
  const width = useInnerWidth();

  const weekWrapperRef = useRef(null);
  const weekCarouselRef = useRef(null);
  const carouselPositionRef = useRef(null);
  const carouselHeightRef = useRef(null);
  const animationIdRef = useRef(null);
  const isMovingXAxisRef = useRef(null);

  const [showWeek, setShowWeek] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [weekWrapperClientRectRight, setWeekWrapperClientRectRight] =
    useState(0);
  const [weekWrapperClientRectLeft, setWeekWrapperClientRectLeft] = useState(0);
  const [startXPosition, setStartXPosition] = useState(0);
  const [startYPosition, setStartYPosition] = useState(0);
  const [previousTranslateX, setPreviousTranslateX] = useState(0);

  const today = new Date().toLocaleDateString('en-US', { timeZone: timezone });
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

  // dynamically set carousel height when using show / hide button
  useEffect(() => {
    carouselHeightRef.current = handleHiddenHeight(weekWrapperRef?.current);
  }, [calendarItems, width]);

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
  }, [width]);

  // handle display of scroll buttons and carousel resize
  useEffect(() => {
    if (!width || width <= MOBILE_BREAKPOINT) return;

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
    }, 100);

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
  }, []);

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

  if (!calendarItems?.length) return <></>;

  return (
    <div className='week__outer-wrapper'>
      <div className='week__wrapper'>
        <button
          className={`h2 ${!showWeek ? 'button-closed' : 'button-open'}`}
          onClick={() => setShowWeek((current) => !current)}
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
                  height: `${carouselHeightRef.current}px`,
                }
              : { height: '0px' }
          }
        >
          <div className='week__calendar-month-year'>
            {moment(today).format('MMMM YYYY')}
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
                  parseInt(moment(Object.keys(item)[0]).format('D')) <
                  parseInt(moment(today).format('D'))
                    ? ' week__calendar-day--past'
                    : ''
                }`}
                key={`calendar-day__${index}`}
                {...(Object.keys(item)[0] === today ? { id: 'today' } : {})}
              >
                <p className='week__day-of-week'>{daysOfWeek[index]}</p>
                <p
                  className={`week__day-of-month${
                    Object.keys(item)[0] === today
                      ? ' week__day-of-month--today'
                      : ''
                  }`}
                >
                  {moment(Object.keys(item)[0]).format('D')}
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
