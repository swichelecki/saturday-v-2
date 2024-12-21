import connectDB from '../../config/db';
import Task from '../../models/Task';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { DetailsForm } from '../../components';

export const metadata = {
  title: 'Details',
};

export const dynamic = 'force-dynamic';

async function getUserId() {
  try {
    await connectDB();

    const { userId, timezone, admin } = await getUserFromCookie();

    const numberOfItems = await Task.find({ userId }).count();

    return { userId, timezone, admin, numberOfItems };
  } catch (error) {
    console.log(error);
  }
}

export default async function AddDetails() {
  const user = await getUserId();

  return <DetailsForm user={user} />;
}
