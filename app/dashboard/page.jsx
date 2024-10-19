import connectDB from '../../config/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Task from '../../models/Task';
import Category from '../../models/Category';
import Reminder from '../../models/Reminder';
import { handleSortItemsAscending } from '../../utilities';
import { Dashboard } from '../../components';

export const metadata = {
  title: 'Dashboard',
};

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  try {
    await connectDB();

    const jwtSecret = process.env.JWT_SECRET;
    const token = cookies().get('saturday');
    let userId;
    let timezone;
    let admin;

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token?.value,
          new TextEncoder().encode(jwtSecret)
        );
        if (payload?.id) {
          userId = payload?.id;
          timezone = payload?.timezone;
          admin = payload?.admin;
        }
      } catch (error) {
        console.log(error);
      }
    }

    const tasksRaw = await Task.find({ userId }).sort({
      priority: 1,
    });

    const categoriesRaw = await Category.find({ userId }).sort({
      priority: 1,
    });

    const reminders = await Reminder.find({
      userId,
      displayReminder: true,
    }).sort({
      reminderDate: 1,
    });

    // create data shape for columns
    const tasks = JSON.parse(JSON.stringify(tasksRaw));
    const categories = JSON.parse(JSON.stringify(categoriesRaw));
    const columnsData = [];

    // return type and column order
    const columnTypes = [
      ...categories.reduce(
        (map, item) => map.set(item?.priority, item?.type),
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
      }
    }

    return {
      tasks: columnsData ?? [],
      categories: categories ?? [],
      reminders: JSON.parse(JSON.stringify(reminders)) ?? [],
      user: { userId, timezone, admin },
    };
  } catch (error) {
    console.log(error);
  }
}

export default async function DashboarPage() {
  const dashboardData = await getDashboardData();
  const { tasks, categories, reminders, user } = dashboardData;

  return (
    <Dashboard
      tasks={tasks}
      categories={categories}
      reminders={reminders}
      user={user}
    />
  );
}
