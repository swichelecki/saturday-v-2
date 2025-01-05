'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { categorySchema } from '../../../schemas/schemas';

export default async function updateCategory(item) {
  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!item?.userId || item?.userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const numberOfItems = await Category.find({ userId: cookieUserId }).count();
  const categorySchemaValidated = categorySchema.safeParse({
    userId: item?.userId,
    priority: item?.priority,
    title: item?.title,
    mandatoryDate: item?.mandatoryDate,
    confirmDeletion: item?.confirmDeletion,
    itemLimit: numberOfItems,
  });

  const { success, error: zodValidationError } = categorySchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    const { _id, userId, priority, title, mandatoryDate, confirmDeletion } =
      item;
    const newItemColumn = priority;

    await Category.updateOne(
      { _id: _id },
      {
        userId,
        priority,
        title,
        mandatoryDate,
        confirmDeletion,
      }
    );

    const itemsOfCategoryType = await Task.find({ type: title, userId });

    itemsOfCategoryType.forEach(async (item) => {
      const {
        _id,
        priority,
        title,
        description,
        confirmDeletion,
        date,
        dateAndTime,
      } = item;

      await Task.updateOne(
        { _id: _id },
        {
          priority,
          column: newItemColumn,
          title,
          description,
          confirmDeletion,
          date,
          dateAndTime,
        }
      );
    });

    revalidatePath('/settings');
    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
