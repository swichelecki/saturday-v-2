import { useContext, useState, useEffect } from 'react';
import { TasksContext } from '../context/tasksContext';
import moment from 'moment-timezone';

const ContentRight = () => {
  const { globalContextTasks } = useContext(TasksContext);

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const tasksWithDates = [...globalContextTasks].filter(
      (item) => item.date !== null
    );

    const taskWithDateObjects = tasksWithDates?.map((item) => {
      return { ...item, date: new Date(item.date) };
    });

    const TasksSortedDateDesc = taskWithDateObjects.sort(
      (objA, objB) => Number(objB.date) - Number(objA.date)
    );

    const taskSortedWithDateStrings = TasksSortedDateDesc.map((item) => {
      return {
        ...item,
        date: new Date(item.date).toISOString().split('T')[0],
      };
    });

    setUpcomingEvents(taskSortedWithDateStrings);
  }, [globalContextTasks]);

  if (!upcomingEvents.length) {
    return null;
  }

  return (
    <section className='content-right-container'>
      <h2>Upcoming</h2>
      {upcomingEvents.map(
        (item, index) =>
          item?.date && (
            <div className='upcoming-item' key={`upcoming-item_${index}`}>
              {item?.dateAndTime ? (
                <>
                  <p className='upcoming-item__date'>
                    {moment(item?.dateAndTime)
                      .tz('America/Chicago')
                      .format('dddd, MMMM D')}{' '}
                  </p>
                  <p className='upcoming-item__time'>
                    {moment(item?.dateAndTime)
                      .tz('America/Chicago')
                      .format('h:mm A')}{' '}
                  </p>
                  <p className='upcoming-item__title'>{item?.title}</p>
                </>
              ) : (
                <>
                  <p className='upcoming-item__date'>
                    {moment(item?.date).format('dddd, MMMM D')}
                  </p>
                  <p className='upcoming-item__title'>{item?.title}</p>
                </>
              )}
            </div>
          )
      )}
    </section>
  );
};

export default ContentRight;
