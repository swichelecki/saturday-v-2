'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { categorySchema } from '../../../schemas/schemas';

export default async function updateCategory(userId, item) {
  if (!(item instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const zodValidationResults = categorySchema.safeParse(item);
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
    // update category - either by draggig to change order in list or using update modal
    const { _id: categoryId, title: categoryTitle } = zodData;

    const { matchedCount } = await Category.updateOne(
      { _id: categoryId, userId: cookieUserId },
      {
        title: categoryTitle,
      },
    );

    if (!matchedCount) {
      return { status: 404, error: 'Category not found' };
    }

    const updatedCategory = await Category.find({
      _id: categoryId,
      userId: cookieUserId,
    });

    // update all tasks associated with category
    const itemsOfCategoryType = await Task.find({
      categoryId,
      userId: cookieUserId,
    });

    if (itemsOfCategoryType?.length > 0) {
      await Task.bulkWrite(
        itemsOfCategoryType.map(({ _id }) => ({
          updateOne: {
            filter: { _id, userId: cookieUserId },
            update: {
              $set: { type: categoryTitle },
            },
          },
        })),
      );
    }

    return {
      status: 200,
      item: JSON.parse(JSON.stringify(updatedCategory[0])),
    };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
