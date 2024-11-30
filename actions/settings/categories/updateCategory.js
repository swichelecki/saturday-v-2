'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { handleServerErrorMessage } from '../../../utilities';
import { categorySchema } from '../../../schemas/schemas';
const jwtSecret = process.env.JWT_SECRET;

export default async function updateCategory(item) {
  // check that cookie user id matches FormData user id
  const token = (await cookies()).get('saturday');
  let cookieUserId;

  if (token) {
    try {
      const { payload } = await jwtVerify(
        token?.value,
        new TextEncoder().encode(jwtSecret)
      );
      if (payload?.id) {
        cookieUserId = payload?.id;
      }
    } catch (error) {
      const errorMessage = handleServerErrorMessage(error);
      console.error(errorMessage);
      return { status: 500, error: errorMessage };
    }
  }

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
    type: item?.type,
    mandatoryDate: item?.mandatoryDate,
    itemLimit: numberOfItems,
  });

  const { success, error: zodValidationError } = categorySchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    const { _id, userId, priority, type, mandatoryDate } = item;
    const newItemColumn = priority;

    await Category.updateOne(
      { _id: _id },
      {
        userId,
        priority,
        type,
        mandatoryDate,
      }
    );

    const itemsOfCategoryType = await Task.find({ type, userId });

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

    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
