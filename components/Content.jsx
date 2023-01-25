import { ContentLeft, ContentRight } from '../components';
import { getUpcomingEvents, getUpcomingBirthdays } from '../utilities';

const Content = () => {
  const upcomingEvents = getUpcomingEvents();
  const upcomingBirthdays = getUpcomingBirthdays();
  const hasContent =
    upcomingEvents?.length > 0 || upcomingBirthdays?.length > 0;

  return (
    <>
      <ContentLeft hasContent={hasContent} />
      <ContentRight
        hasContent={hasContent}
        upcomingEvents={upcomingEvents}
        upcomingBirthdays={upcomingBirthdays}
      />
    </>
  );
};

export default Content;
