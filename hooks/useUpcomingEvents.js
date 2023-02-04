import { useContext, useState, useEffect } from 'react';
import { TasksContext } from '../context/tasksContext';

export const useUpcomingEvents = () => {
  const { globalContextTasks } = useContext(TasksContext);

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const tasksWithDates = [...globalContextTasks].filter(
      (item) => item.date !== null && !item.dateAndTime
    );

    const formattedTasksWithDateAndTime = [...globalContextTasks]
      .filter((item) => item.dateAndTime !== null)
      .map((item) => {
        const date = item.dateAndTime.split('T')[0];
        return { ...item, date };
      });

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

  return upcomingEvents;
};
