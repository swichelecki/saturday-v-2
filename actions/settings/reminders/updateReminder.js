'use server';

import Reminder from '../../../models/Reminder';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { reminderSchema } from '../../../schemas/schemas';

export default async function updateReminder(item) {
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
  const zodValidationResults = reminderSchema.safeParse(item);
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
      title,
      reminderDate,
      reminderSortDate,
      recurrenceInterval,
      recurrenceBuffer,
      exactRecurringDate,
      displayReminder,
      confirmDeletion,
    } = zodData;

    const { matchedCount } = await Reminder.updateOne(
      { _id: _id, userId: cookieUserId },
      {
        title,
        reminderDate,
        reminderSortDate,
        recurrenceInterval,
        recurrenceBuffer,
        exactRecurringDate,
        displayReminder,
        confirmDeletion,
      },
    );

    if (!matchedCount) {
      return { status: 404, error: 'Reminder not found' };
    }

    const result = await Reminder.findOne({ _id: _id, userId: cookieUserId });
    return { status: 200, item: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
