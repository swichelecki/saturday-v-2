import moment from 'moment-timezone';
import { FaBirthdayCake } from 'react-icons/fa';

const Birthdays = ({ upcomingBirthdays }) => {
  if (!upcomingBirthdays.length) {
    return null;
  }

  return (
    <section className='content-right-item'>
      <h2>
        <FaBirthdayCake />
        Birthdays
      </h2>
      {upcomingBirthdays.map((item, index) => (
        <div className='upcoming-item' key={`upcoming-item_${index}`}>
          <p className='upcoming-item__date'>
            {moment(item?.date?.split('T')[0]).format('dddd, MMMM D')}
          </p>
          <p className='upcoming-item__title'>{item?.name}</p>
          <span></span>
        </div>
      ))}
    </section>
  );
};

export default Birthdays;
