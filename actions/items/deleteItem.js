'use server';

import Task from '../../models/Task';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../utilities';

export default async function deleteTask(_id) {
  try {
    const result = await Task.find({ _id: _id });
    await Task.deleteOne({ _id: _id });
    revalidatePath('/dashboard');
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
