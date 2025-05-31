import moment from 'moment-timezone';

export const WeekItem = ({ title, dateAndTime, timezone }) => {
  return (
    <div className='week__calendar-item'>
      <div className='week__calendar-item-event'>
        {dateAndTime && (
          <p className='week__calendar-item-event-date'>
            {moment(dateAndTime).tz(timezone).format('h:mm A')}
          </p>
        )}
        <p className='week__calendar-item-event-title'>{title}</p>
      </div>
    </div>
  );
};

export default WeekItem;
