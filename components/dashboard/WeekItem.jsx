import moment from 'moment-timezone';

export const WeekItem = ({ title, dateAndTime, timezone }) => {
  return (
    <div className='week__calendar-item'>
      {dateAndTime && (
        <p className='week__calendar-item-time'>
          {moment(dateAndTime).tz(timezone).format('h:mm A')}
        </p>
      )}
      <p className='week__calendar-item-event'>{title}</p>
    </div>
  );
};

export default WeekItem;
