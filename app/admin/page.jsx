import connectDB from '../../config/db';
import User from '../../models/User';
import Task from '../../models/Task';
import Category from '../../models/Category';
import Reminder from '../../models/Reminder';
import Note from '../../models/Note';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { AdminDashboard } from '../../components';

export const metadata = {
  title: 'Admin',
};

export const dynamic = 'force-dynamic';

async function getAdminData() {
  try {
    await connectDB();

    const { userId, admin, timezone } = await getUserFromCookie();

    if (!admin) throw new Error('User is not an admin.');

    const usersRaw = await User.find().sort({ updatedAt: -1 });
    const users = JSON.parse(JSON.stringify(usersRaw));

    // put user item counts into their own array
    const getUserDataCounts = async (userId) => {
      const [dashboardItemsCount, categoriesCount, remindersCount, notesCount] =
        await Promise.all([
          Task.countDocuments({ userId }),
          Category.countDocuments({ userId }),
          Reminder.countDocuments({ userId }),
          Note.countDocuments({ userId }),
        ]);

      return {
        dashboardItemsCount,
        categoriesCount,
        remindersCount,
        notesCount,
      };
    };

    // add user item counts to the user data array
    const usersWithDataCount = await users.reduce(async (acc, item) => {
      const resolvedAcc = await acc;

      const {
        dashboardItemsCount,
        categoriesCount,
        remindersCount,
        notesCount,
      } = await getUserDataCounts(item?._id);

      resolvedAcc.push({
        ...item,
        dashboardItemsCount,
        categoriesCount,
        remindersCount,
        notesCount,
      });

      return resolvedAcc;
    }, []);

    return {
      users: usersWithDataCount ?? [],
      user: { userId, admin, timezone },
    };
  } catch (error) {
    console.log(error);
  }
}

export default async function AdminPage() {
  const adminData = await getAdminData();
  const { users, user } = adminData;
  return <AdminDashboard user={user} users={users} />;
}
