import connectDB from '../../config/db';
import Task from '../../models/Task';
import Category from '../../models/Category';
import Reminder from '../../models/Reminder';
import { handleSortItemsAscending } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { Dashboard } from '../../components';

export const metadata = {
  title: 'Dashboard',
};

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  try {
    await connectDB();

    const { userId, timezone, admin } = await getUserFromCookie();

    const [tasksRaw, categoriesRaw, remindersRaw] = await Promise.all([
      Task.find({ userId }).sort({
        priority: 1,
      }),
      Category.find({ userId }).sort({
        priority: 1,
      }),
      Reminder.find({
        userId,
        displayReminder: true,
      }).sort({
        reminderDate: 1,
      }),
    ]);

    // create data shape for columns
    const tasks = JSON.parse(JSON.stringify(tasksRaw));
    const categories = JSON.parse(JSON.stringify(categoriesRaw));
    const reminders = JSON.parse(JSON.stringify(remindersRaw));
    const columnsData = [];
    const calendarItems = [];
    let calendarData = [];

    // return type and column order
    const columnTypes = [
      ...categories.reduce(
        (map, item) => map.set(item?.priority, item?.title),
        new Map()
      ),
    ];

    // sort column order ascending
    const sortedColumnTypes = columnTypes.sort((a, b) => a[0] - b[0]);

    // create data structure
    for (const item of sortedColumnTypes) {
      const obj = {};
      obj[item[1]] = [];
      columnsData.push(obj);
    }

    // add items to array
    for (const item of tasks) {
      for (const column of columnsData) {
        if (Object.keys(column)[0] === item?.type) {
          Object.values(column)[0].push(item);
        }
      }
    }

    // sort arrays by date asc when date is present
    for (const item of columnsData) {
      if (
        Object.values(item)[0]?.length &&
        Object.values(item)[0][0]['date'] !== null
      ) {
        const itemsWithDatesSortedAsc = handleSortItemsAscending(
          Object.values(item)[0],
          'date'
        );

        Object.values(item)[0].length = 0;
        Object.values(item)[0].push(...itemsWithDatesSortedAsc);
        calendarItems.push(...itemsWithDatesSortedAsc);
      }
    }

    // add reminders with exact recurring dates to week array
    for (const item of reminders) {
      if (item?.exactRecurringDate)
        calendarItems.push({
          ...item,
          date: new Date(item?.reminderDate).toISOString().split('T')[0],
        });
    }

    if (calendarItems?.length > 0) {
      // get sunday using current date
      const getSunday = (today) => {
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek;
        return new Date(today.setDate(diff));
      };

      // create array of all days of the week
      const sunday = getSunday(new Date());
      const daysOfWeek = [];
      daysOfWeek.push(sunday);
      const sundayCopy = new Date(sunday);
      for (let i = 1; i <= 6; i++) {
        daysOfWeek.push(new Date(sundayCopy.setDate(sundayCopy.getDate() + 1)));
      }

      // create data shape for week component
      calendarData = daysOfWeek.reduce((calendarDays, item) => {
        const day = item.getDate();
        calendarDays.push({
          [day]: [
            ...calendarItems?.filter((calItem) => {
              const calItemDate = new Date(calItem?.date);
              const calItemDateString = calItemDate.toISOString();
              const calItemYearDayMonth = calItemDateString.split('T')[0];
              const dayOfWeekDateString = item.toISOString();
              const dayOfWeekYearDayMonth = dayOfWeekDateString.split('T')[0];

              if (calItemYearDayMonth === dayOfWeekYearDayMonth) {
                return calItem;
              }
            }),
          ],
        });

        return calendarDays;
      }, []);
    }

    return {
      tasks: columnsData ?? [],
      calendar: calendarData ?? [],
      categories: categories ?? [],
      reminders: reminders ?? [],
      user: { userId, timezone, admin },
    };
  } catch (error) {
    console.log(error);
  }
}

export default async function DashboarPage() {
  const dashboardData = await getDashboardData();
  const { tasks, calendar, categories, reminders, user } = dashboardData;

  return (
    <Dashboard
      tasks={tasks}
      calendar={calendar}
      categories={categories}
      reminders={reminders}
      user={user}
    />
  );
}
