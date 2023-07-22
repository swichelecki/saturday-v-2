import moment from 'moment-timezone';

const ListItemBirthday = ({ name, date }) => {
  const todaysDate = new Date();
  const birthdayIsToday =
    todaysDate.toISOString().split('T')[0] === date.split('T')[0];

  return (
    <div className='list-item__outer-wrapper'>
      <div className='list-item__inner-wrapper list-item__inner-wrapper--upcoming'>
        <div className='list-item__upcoming-date-time'>
          <p>{moment(date?.split('T')[0]).format('dddd, MMMM D')}</p>
        </div>
        <div className='list-item__item'>
          <div className='list-item__item-hover-zone list-item__item-hover-zone--upcoming'>
            <p>
              {name} {birthdayIsToday && <strong>TODAY!</strong>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItemBirthday;
