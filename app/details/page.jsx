import connectDB from '../../config/db';
import { Suspense } from 'react';
import Task from '../../models/Task';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { DetailsForm } from '../../components';

export const metadata = {
  title: 'Details',
};

async function DetailsWithData() {
  await connectDB();

  const { userId, timezone } = await getUserFromCookie();
  const numberOfItems = await Task.find({ userId }).count();
  const user = { userId, timezone, numberOfItems };

  return <DetailsForm user={user} />;
}

export default function AddDetails() {
  return (
    <Suspense>
      <DetailsWithData />
    </Suspense>
  );
}
