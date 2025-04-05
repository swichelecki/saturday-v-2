import moment from 'moment-timezone';

export const WeekItem = ({ title, dateAndTime, timezone }) => {
  return (
    <div className='week__calendar-item'>
      <div className='week__calendar-item-event'>
        {dateAndTime && (
          <>
            {moment(dateAndTime).tz(timezone).format('h:mm A')} <br />
          </>
        )}
        {title}
      </div>
    </div>
  );
};

export default WeekItem;
