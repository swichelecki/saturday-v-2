import { ContentLeft, ContentRight } from '../components';
import { useUpcomingEvents, useUpcomingBirthdays } from '../hooks';

const Content = () => {
  const upcomingEvents = useUpcomingEvents();
  const upcomingBirthdays = useUpcomingBirthdays();
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
