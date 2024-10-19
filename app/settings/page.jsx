import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Category from '../../models/Category';
import Reminder from '../../models/Reminder';
import { Settings } from '../../components';

export const metadata = {
  title: 'Settings',
};

export const dynamic = 'force-dynamic';

async function getSettingsData() {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const token = cookies().get('saturday');
    let userId;
    let newUser;
    let timezone;
    let admin;

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token.value,
          new TextEncoder().encode(jwtSecret)
        );
        if (payload?.id) {
          userId = payload?.id;
          timezone = payload?.timezone;
          admin = payload?.admin;
          newUser = payload?.newUser;
        }
      } catch (error) {
        console.log(error);
      }
    }

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
