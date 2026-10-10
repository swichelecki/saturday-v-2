'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { itemPrioritiesSchema } from '../../../schemas/schemas';

export default async function updateCategoryPriorities(userId, items) {
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  const zodValidationResults = itemPrioritiesSchema.safeParse({
    userId,
    items,
  });
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
    // Update category item priorities
    const { matchedCount } = await Category.bulkWrite(
      zodData.items.map(({ _id, priority }) => ({
        updateOne: {
          filter: { _id, userId: cookieUserId },
          update: { $set: { priority } },
        },
      })),
    );

    // Update items related to categories
    zodData.items.map(
      async ({ _id: categoryId, priority: categoryPriority }) => {
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
                  $set: { column: categoryPriority },
                },
              },
            })),
          );
        }
      },
    );

    if (matchedCount !== zodData.items.length) {
      return { status: 404, error: 'One or more items not found' };
    }

    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
