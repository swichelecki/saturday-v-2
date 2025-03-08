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

  const [showWeek, setShowWeek] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [weekWrapperClientRectRight, setWeekWrapperClientRectRight] =
    useState(0);
  const [weekWrapperClientRectLeft, setWeekWrapperClientRectLeft] = useState(0);

  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

  // handle display of scroll buttons and carousel resize
  useEffect(() => {
    weekCarouselRef?.current?.scrollWidth > weekWrapperRef?.current?.offsetWidth
      ? setShowScrollButtons(true)
      : setShowScrollButtons(false);

    setWeekWrapperClientRectRight(
      weekWrapperRef?.current?.getBoundingClientRect().right
    );
    setWeekWrapperClientRectLeft(
      weekWrapperRef?.current?.getBoundingClientRect().left
    );

    if (weekCarouselRef.current && carouselPositionRef.current) {
      weekCarouselRef.current.style.transform = 'translateX(0)';
      carouselPositionRef.current = 0;
    }
  }, [width]);

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

    weekCarouselRef.current.style.overflow = 'visible';
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

    weekCarouselRef.current.style.overflow = 'visible';
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
                  height: `${handleHiddenHeight(weekWrapperRef?.current)}px`,
                }
              : { height: '0px' }
          }
        >
          <div className='week__calendar-month-year'>
            {moment(today).tz(timezone).format('MMMM YYYY')}
          </div>
          <div className='week__calendar-carousel' ref={weekCarouselRef}>
            {calendarItems?.map((item, index) => (
              <div
                className={`week__calendar-day ${
                  dayOfMonth.toString() !== Object.keys(item)[0]
                    ? 'week__calendar-day--past'
                    : ''
                }`}
                key={`calendar-day__${index}`}
              >
                <p className='week__day-of-week'>{daysOfWeek[index]}</p>
                <p
                  className={`week__day-of-month${
                    dayOfMonth.toString() === Object.keys(item)[0]
                      ? '--today'
                      : ''
                  }`}
                >
                  {Object.keys(item)[0]}
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
