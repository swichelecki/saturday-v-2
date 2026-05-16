'use server';

import Reminder from '../../../models/Reminder';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';

export default async function getReminder(userId, id) {
  // check that cookie user id matches param userId
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  try {
    const result = await Reminder.findOne({ _id: id });
    const item = JSON.parse(JSON.stringify(result));
    item.reminderDate = item.reminderDate?.replace('Z', '');
    item.reminderSortDate = item.reminderSortDate?.replace('Z', '');

    return { status: 200, item };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
