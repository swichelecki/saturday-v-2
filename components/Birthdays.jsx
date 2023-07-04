import { useState, useEffect, useRef } from 'react';
import { useUpcomingBirthdays } from '../hooks';
import moment from 'moment-timezone';
import { FaBirthdayCake } from 'react-icons/fa';

const Birthdays = () => {
  const upcomingBirthdays = useUpcomingBirthdays();

  const birthdaysRef = useRef(null);

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      birthdaysRef.current.style.transform = 'translateX(0)';
    }, 1500);
  }, []);

  const handleOpenCloseBirthdays = () => {
    isOpen
      ? (birthdaysRef.current.style.transform = 'translateX(-200px)')
      : (birthdaysRef.current.style.transform = 'translateX(0)');

    setIsOpen((current) => !current);
  };

  if (!upcomingBirthdays.length) return null;

  return (
    <section ref={birthdaysRef} className='birthdays__outer-wrapper'>
      <div className='birthdays__inner-wrapper'>
        {upcomingBirthdays.map((item, index) => (
          <div className='birthdays__item' key={`birthday_${index}`}>
            <p>{moment(item?.date?.split('T')[0]).format('dddd, MMMM D')}</p>
            <p>{item?.name}</p>
            <span></span>
          </div>
        ))}
        <button onClick={handleOpenCloseBirthdays} className='birthdays__tab'>
          <FaBirthdayCake />
        </button>
      </div>
    </section>
  );
};

export default Birthdays;
