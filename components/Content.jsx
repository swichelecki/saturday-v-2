import { ContentLeft, ContentRight } from '../components';
import { getUpcomingEvents, getUpcomingBirthdays } from '../utilities';

const Content = () => {
  const upcomingEvents = getUpcomingEvents();
  const upcomingBirthdays = getUpcomingBirthdays();
  const hasContentRight =
    upcomingEvents?.length > 0 || upcomingBirthdays?.length > 0;

  return (
    <>
      <ContentLeft hasContentRight={hasContentRight} />
      <ContentRight
        hasContentRight={hasContentRight}
        upcomingEvents={upcomingEvents}
        upcomingBirthdays={upcomingBirthdays}
      />
    </>
  );
};

export default Content;
