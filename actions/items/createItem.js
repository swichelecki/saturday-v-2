'use server';

import Task from '../../models/Task';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { itemSchema } from '../../schemas/schemas';

export default async function createItem(formData) {
  if (!(formData instanceof FormData)) {
    return {
      status: 400,
      error: 'Not FormData',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!formData.get('userId') || formData.get('userId') !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const numberOfItems = await Task.find({ userId: cookieUserId }).count();
  const itemSchemaValidated = itemSchema.safeParse({
    userId: formData.get('userId'),
    categoryId: formData.get('categoryId'),
    title: formData.get('title'),
    column: formData.get('column'),
    priority: formData.get('priority'),
    type: formData.get('type'),
    description: formData.get('description'),
    date: formData.get('date'),
    dateAndTime: formData.get('dateAndTime'),
    mandatoryDate: formData.get('mandatoryDate'),
    confirmDeletion: formData.get('confirmDeletion'),
    isDetailsForm: formData.get('isDetailsForm'),
    itemLimit: numberOfItems,
  });

  const { success, error: zodValidationError } = itemSchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    const {
      categoryId,
      title,
      description,
      date,
      dateAndTime,
      userId,
      priority,
      type,
      column,
      confirmDeletion,
      mandatoryDate,
    } = Object.fromEntries(formData);

    const result = await Task.create({
      categoryId,
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
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
