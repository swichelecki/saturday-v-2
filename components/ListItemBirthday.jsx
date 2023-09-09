import { handleTodaysDateCheck } from 'utilities';
import moment from 'moment-timezone';

const ListItemBirthday = ({ name, date }) => {
  const isToday = handleTodaysDateCheck(date);

  return (
    <div className='list-item__outer-wrapper'>
      <div className='list-item__inner-wrapper list-item__inner-wrapper--upcoming'>
        <div
          className={`list-item__upcoming-date-time${
            isToday ? ' list-item__upcoming-date-time--is-today' : ''
          }`}
        >
          <p>
            {isToday && 'Today,'}{' '}
            {moment(date?.split('T')[0]).format('dddd, MMMM D')}
          </p>
        </div>
        <div className='list-item__item'>
          <div className='list-item__item-hover-zone list-item__item-hover-zone--upcoming'>
            <p>{name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItemBirthday;
