import connectDB from '../../config/db';
import { Suspense } from 'react';
import Category from '../../models/Category';
import Reminder from '../../models/Reminder';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { Settings } from '../../components';

export const metadata = {
  title: 'Settings',
};

async function SettingsWithData() {
  await connectDB();

  try {
    const { userId, newUser, timezone, isSubscribed } =
      await getUserFromCookie();

    const [categories, reminders] = await Promise.all([
      Category.find({ userId }).sort({
        priority: 1,
      }),
      Reminder.find({ userId }).sort({ reminderSortDate: 1 }),
    ]);

    return (
      <Settings
        categories={JSON.parse(JSON.stringify(categories)) ?? []}
        reminders={JSON.parse(JSON.stringify(reminders)) ?? []}
        user={{ userId, timezone, newUser, isSubscribed }}
      />
    );
  } catch (error) {
    console.log(error);
  }
}

export default async function SettingsPage() {
  return (
    <Suspense>
      <SettingsWithData />
    </Suspense>
  );
}
