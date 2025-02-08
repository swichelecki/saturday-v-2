'use server';

import Category from '../../../models/Category';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { categorySchema } from '../../../schemas/schemas';

export default async function createCategory(item) {
  if (!(item instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that cookie user id matches item user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  const { userId, title } = item;
  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  const categoryExists = await Category.findOne({ userId, title });
  if (categoryExists) return { status: 409 };

  // check that data shape is correct
  const numberOfItems = await Category.find({ userId: cookieUserId }).count();
  const zodValidationResults = categorySchema.safeParse({
    ...item,
    itemLimit: numberOfItems,
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
    const { userId, priority, mandatoryDate, title, confirmDeletion } = zodData;
    const result = await Category.create({
      userId,
      priority,
      mandatoryDate,
      title,
      confirmDeletion,
    });
    revalidatePath('/settings');
    return { status: 200, item: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
