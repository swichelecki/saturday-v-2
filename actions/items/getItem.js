'use server';

import Task from '../../models/Task';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';

export default async function getItem(id, userId) {
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
    const result = await Task.find({ _id: id });
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
