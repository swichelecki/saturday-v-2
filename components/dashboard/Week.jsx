'use client';

import { useState, useRef } from 'react';
import { handleHiddenHeight } from '../../utilities';
import { WeekItem } from '../../components';

const Week = ({ calendarItems, timezone }) => {
  const weekRef = useRef(null);

  const [showWeek, setShowWeek] = useState(true);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

  if (!calendarItems?.length) return <></>;

  return (
    <div className='week__wrapper'>
      <button
        className={`h2 ${!showWeek ? 'button-closed' : 'button-open'}`}
        onClick={() => setShowWeek((current) => !current)}
        type='button'
      >
        Week at a Glance
      </button>
      <div
        className='week__inner-wrapper'
        ref={weekRef}
        style={
          showWeek
            ? {
                height: `${handleHiddenHeight(weekRef?.current)}px`,
              }
            : { height: '0px' }
        }
      >
        <div className='week__calendar-wrapper'>
          {calendarItems?.map((item, index) => (
            <div className='week__calendar-day' key={`calendar-day__${index}`}>
              <p className='week__day-of-week'>{daysOfWeek[index]}</p>
              <p className='week__day-of-month'>{Object.keys(item)[0]}</p>
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
  );
};

export default Week;
