'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';

export default async function deleteCategory(userId, _id) {
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
    const { deletedCount } = await Category.deleteOne({
      _id: _id,
      userId: cookieUserId,
    });

    if (!deletedCount) {
      return { status: 404, error: 'Category not found' };
    }

    await Task.deleteMany({ categoryId: _id, userId: cookieUserId });
    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
