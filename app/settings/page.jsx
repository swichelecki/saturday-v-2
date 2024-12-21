import Category from '../../models/Category';
import Reminder from '../../models/Reminder';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { Settings } from '../../components';

export const metadata = {
  title: 'Settings',
};

export const dynamic = 'force-dynamic';

async function getSettingsData() {
  try {
    const { userId, newUser, timezone, admin } = await getUserFromCookie();

    const categories = await Category.find({ userId }).sort({
      priority: 1,
    });

    const reminders = await Reminder.find({ userId }).sort({ reminderDate: 1 });

    return {
      categories: JSON.parse(JSON.stringify(categories)) ?? [],
      reminders: JSON.parse(JSON.stringify(reminders)) ?? [],
      user: {
        userId,
        timezone,
        admin,
        newUser,
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
