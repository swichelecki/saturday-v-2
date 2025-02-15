import connectDB from '../../../config/db';
import Task from '../../../models/Task';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { DetailsForm } from '../../../components';

export const metadata = {
  title: 'Details',
};

export const dynamic = 'force-dynamic';

async function getFormData(id) {
  try {
    await connectDB();

    const { userId, timezone, admin } = await getUserFromCookie();

    const [task, numberOfItems] = await Promise.all([
      Task.find({ _id: id, userId }),
      Task.find({ userId }).count(),
    ]);

    return {
      task: JSON.parse(JSON.stringify(task[0])),
      user: { userId, timezone, admin, numberOfItems },
    };
  } catch (error) {
    console.log(error);
  }
}

export default async function EditDetails(props) {
  const params = await props.params;
  const { id } = params;
  const { task, user } = await getFormData(id);

  return <DetailsForm task={task} user={user} />;
}
