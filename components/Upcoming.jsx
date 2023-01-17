import { useContext, useState, useEffect } from 'react';
import { TasksContext } from '../context/tasksContext';
import moment from 'moment-timezone';

const Upcoming = () => {
  const { globalContextTasks } = useContext(TasksContext);

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const tasksWithDates = [...globalContextTasks].filter(
      (item) => item.date !== null
    );

    const formattedTasksWithDateAndTime = [...globalContextTasks].filter(
      (item) => {
        if (item.dateAndTime && item.dateAndTime !== null) {
          const formattedDateAndTime = item.dateAndTime.split('T')[0];
          return { ...item, formattedDateAndTime };
        }
      }
    );

    const allTasksWithDates = [
      ...tasksWithDates,
      ...formattedTasksWithDateAndTime,
    ];

    const taskWithDateObjects = allTasksWithDates?.map((item) => {
      return { ...item, date: new Date(item.date) };
    });

    const TasksSortedDateAsc = taskWithDateObjects.sort(
      (objA, objB) => Number(objA.date) - Number(objB.date)
    );

    const taskSortedWithDateStrings = TasksSortedDateAsc.map((item) => {
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
    <section className='content-right-item'>
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
              <span></span>
            </div>
          )
      )}
    </section>
  );
};

export default Upcoming;
