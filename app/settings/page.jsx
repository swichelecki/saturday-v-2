import connectDB from '../../config/db';
import Category from '../../models/Category';
import Reminder from '../../models/Reminder';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { Settings } from '../../components';

export const metadata = {
  title: 'Settings',
};

export const dynamic = 'force-dynamic';

async function getSettingsData() {
  await connectDB();

  try {
    const { userId, newUser, timezone, admin, isSubscribed } =
      await getUserFromCookie();

    const [categories, reminders] = await Promise.all([
      Category.find({ userId }).sort({
        priority: 1,
      }),
      Reminder.find({ userId }).sort({ reminderDate: 1 }),
    ]);

    return {
      categories: JSON.parse(JSON.stringify(categories)) ?? [],
      reminders: JSON.parse(JSON.stringify(reminders)) ?? [],
      user: {
        userId,
        timezone,
        admin,
        newUser,
        isSubscribed,
      },
    };
  } catch (error) {
    console.log(error);
  }
}

export default async function SettingsPage() {
  const { categories, reminders, user } = await getSettingsData();

  return <Settings categories={categories} reminders={reminders} user={user} />;
}
