import Upcoming from './Upcoming';
import Birthdays from './Birthdays';

const ContentRight = ({ hasContent, upcomingEvents, upcomingBirthdays }) => {
  return (
    <section
      className={`content-right-container${
        !hasContent ? ' content-right-container--display-none' : ''
      }`}
    >
      <Upcoming upcomingEvents={upcomingEvents} />
      <Birthdays upcomingBirthdays={upcomingBirthdays} />
    </section>
  );
};

export default ContentRight;
