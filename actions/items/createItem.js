'use server';

import Task from '../../models/Task';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../utilities';

export default async function createItem(formData) {
  const {
    title,
    description,
    dateAndTime,
    userId,
    priority,
    type,
    column,
    confirmDeletion,
    mandatoryDate,
  } = Object.fromEntries(formData);

  try {
    const date = formData.get('dateAndTime')
      ? formData.get('dateAndTime').split('T')[0]
      : formData.get('date');

    const result = await Task.create({
      userId,
      title,
      description,
      date,
      dateAndTime,
      priority,
      type,
      column,
      confirmDeletion,
      mandatoryDate,
    });

    revalidatePath('/dashboard');

    return { status: 200, item: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
