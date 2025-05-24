import connectDB from '../../config/db';
import Task from '../../models/Task';
import Category from '../../models/Category';
import Reminder from '../../models/Reminder';
import Holiday from '../../models/Holiday';
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

    // get monday using current date
    const getMonday = (today) => {
      const dayOfWeek =
        today.getDay() === 0 ? today.getDay() + 6 : today.getDay() - 1;
      const diff = today.getDate() - dayOfWeek;
      const dateInUsersTimezone = Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
      }).format(today.setDate(diff));
      return new Date(dateInUsersTimezone);
    };

    const monday = getMonday(new Date());
    const mondayHolidayDate = new Date(monday);
    const mondayHoliday = mondayHolidayDate.toISOString().split('T')[0];
    const sunday = mondayHolidayDate.setDate(mondayHolidayDate.getDate() + 6);
    const sundayHoliday = new Date(sunday).toISOString().split('T')[0];

    const [tasksRaw, categoriesRaw, remindersRaw, holidaysRaw] =
      await Promise.all([
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
        Holiday.find({
          date: {
            $gte: mondayHoliday,
            $lte: sundayHoliday,
          },
        }),
      ]);

    // create data shape for columns
    const tasks = JSON.parse(JSON.stringify(tasksRaw));
    const categories = JSON.parse(JSON.stringify(categoriesRaw));
    const reminders = JSON.parse(JSON.stringify(remindersRaw));
    const holidays = JSON.parse(JSON.stringify(holidaysRaw));
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

    // add holidays to week array
    for (const holiday of holidays) {
      calendarItems.push(holiday);
    }

    if (calendarItems?.length > 0) {
      // create array of all days of the week
      const daysOfWeek = [];
      daysOfWeek.push(monday);
      const mondayCopy = new Date(monday);
      for (let i = 1; i <= 6; i++) {
        daysOfWeek.push(new Date(mondayCopy.setDate(mondayCopy.getDate() + 1)));
      }

      // create data shape for week component
      calendarData = daysOfWeek.reduce((calendarDays, day) => {
        const dayOfWeekDateString = day.toISOString();
        const dayOfWeekYearDayMonth = dayOfWeekDateString.split('T')[0];
        calendarDays.push({
          [day.getDate()]: [
            ...calendarItems?.filter((calItem) => {
              const calItemDate = new Date(calItem?.date);
              const calItemDateString = calItemDate.toISOString();
              const calItemYearDayMonth = calItemDateString.split('T')[0];
              if (calItemYearDayMonth === dayOfWeekYearDayMonth) return calItem;
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
