import Upcoming from './Upcoming';
import Birthdays from './Birthdays';

const ContentRight = ({
  hasContentRight,
  upcomingEvents,
  upcomingBirthdays,
}) => {
  return (
    <section
      className={`content-right-container${
        !hasContentRight ? ' content-right-container--display-none' : ''
      }`}
    >
      <Upcoming upcomingEvents={upcomingEvents} />
      <Birthdays upcomingBirthdays={upcomingBirthdays} />
    </section>
  );
};

export default ContentRight;
