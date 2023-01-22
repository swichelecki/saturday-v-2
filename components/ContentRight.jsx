import Upcoming from './Upcoming';
import Birthdays from './Birthdays';
import { getUpcomingEvents, getUpcomingBirthdays } from '../utilities';

const ContentRight = () => {
  const upcomingEvents = getUpcomingEvents();
  const upcomingBirthdays = getUpcomingBirthdays();
  const hasContent =
    upcomingEvents?.length > 0 || upcomingBirthdays?.length > 0;

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
