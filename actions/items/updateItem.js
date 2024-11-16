'use server';

import Task from '../../models/Task';
import { handleServerErrorMessage } from '../../utilities';
//import { revalidatePath } from 'next/cache';

export default async function itemUpdate(formData) {
  const { _id, title, description, priority, column, confirmDeletion } =
    Object.fromEntries(formData);

  try {
    const date = formData.get('dateAndTime')
      ? formData.get('dateAndTime').split('T')[0]
      : !formData.get('dateAndTime') && formData.get('date')
      ? formData.get('date')
      : null;

    const dateAndTime = formData.get('dateAndTime')
      ? new Date(formData.get('dateAndTime')).toISOString()
      : null;

    await Task.updateOne(
      { _id: _id },
      {
        priority,
        column,
        title,
        description,
        confirmDeletion,
        date,
        dateAndTime,
      }
    );

    const result = await Task.find({ _id: _id });

    //revalidatePath('/dashboard');

    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
