'use server';

import Note from '../../models/Note';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { noteSchema } from '../../schemas/schemas';

export default async function updateNote(item) {
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
  const numberOfItems = await Note.find({ userId: cookieUserId }).count();
  const zodValidationResults = noteSchema.safeParse({
    ...item,
    itemLimit: numberOfItems - 1,
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
    const {
      _id,
      userId,
      title,
      description,
      date,
      pinned,
      pinnedDate,
      type,
      confirmDeletion,
    } = zodData;

    await Note.updateOne(
      { _id: _id },
      {
        userId,
        title,
        description,
        date,
        pinned,
        pinnedDate,
        type,
        confirmDeletion,
      }
    );

    const result = await Note.find({ _id: _id });
    revalidatePath('/notes');
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
