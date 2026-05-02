import connectDB from '../../../config/db';
import { Suspense } from 'react';
import Task from '../../../models/Task';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { DetailsForm } from '../../../components';

export const metadata = {
  title: 'Details',
};

async function DetailsWithData({ id }) {
  try {
    await connectDB();

    const { userId, timezone } = await getUserFromCookie();

    const [task, numberOfItems] = await Promise.all([
      Task.find({ _id: id, userId }),
      Task.find({ userId }).count(),
    ]);

    return (
      <DetailsForm
        task={JSON.parse(JSON.stringify(task[0]))}
        user={{ userId, timezone, numberOfItems }}
      />
    );
  } catch (error) {
    console.log(error);
  }
}

export default async function EditDetails(props) {
  const params = await props.params;
  const { id } = params;

  return (
    <Suspense>
      <DetailsWithData id={id} />
    </Suspense>
  );
}
