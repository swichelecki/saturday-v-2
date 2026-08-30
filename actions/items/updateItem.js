'use server';

import Task from '../../models/Task';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { itemSchema } from '../../schemas/schemas';

export default async function itemUpdate(item) {
  if (!(item instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  const { userId } = item;
  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const zodValidationResults = itemSchema.safeParse(item);
  const {
    data: zodData,
    success,
    error: zodValidationError,
  } = zodValidationResults;
  if (!success) {
    console.error(zodValidationError);
    return {
      status: 400,
      error: 'Zod validation failed. Check server console.',
    };
  }

  try {
    const {
      _id,
      categoryId,
      title,
      description,
      priority,
      type,
      column,
      date,
      dateAndTime,
      confirmDeletion,
    } = zodData;

    const { matchedCount } = await Task.updateOne(
      { _id, userId: cookieUserId },
      {
        categoryId,
        title,
        description,
        date,
        dateAndTime,
        priority,
        type,
        column,
        confirmDeletion,
      },
    );

    if (!matchedCount) {
      return { status: 404, error: 'Item not found' };
    }

    const result = await Task.find({ _id, userId: cookieUserId });
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
