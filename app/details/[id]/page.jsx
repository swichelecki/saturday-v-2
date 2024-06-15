import connectDB from '../../../config/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Task from '../../../models/Task';
import { DetailsForm } from '../../../components';

async function getFormData(id) {
  try {
    await connectDB();
    const jwtSecret = process.env.JWT_SECRET;
    const token = cookies().get('saturday');

    let userId;

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token.value,
          new TextEncoder().encode(jwtSecret)
        );
        if (payload?.id) {
          userId = payload?.id;
        }
      } catch (error) {
        console.log(error);
      }
    }

    const task = await Task.find({ _id: id, userId });

    return JSON.parse(JSON.stringify(task[0]));
  } catch (error) {
    console.log(error);
  }
}

export default async function EditDetails({ params }) {
  const { id } = params;
  const task = await getFormData(id);

  return <DetailsForm task={task} />;
}
