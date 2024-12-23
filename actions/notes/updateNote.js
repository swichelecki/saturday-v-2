'use server';

import Note from '../../models/Note';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { noteSchema } from '../../schemas/schemas';

export default async function updateNote(formData) {
  if (!(formData instanceof FormData)) {
    return {
      status: 400,
      error: 'Not FormData',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!formData.get('userId') || formData.get('userId') !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const numberOfItems = await Note.find({ userId: cookieUserId }).count();
  const noteSchemaValidated = noteSchema.safeParse({
    _id: formData.get('_id'),
    userId: formData.get('userId'),
    title: formData.get('title'),
    description: formData.get('description'),
    date: formData.get('date'),
    pinned: formData.get('pinned'),
    pinnedDate: formData.get('pinnedDate'),
    type: formData.get('type'),
    confirmDeletion: formData.get('confirmDeletion'),
    itemLimit: numberOfItems - 1,
  });

  const { success, error: zodValidationError } = noteSchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
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
    } = Object.fromEntries(formData);

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

    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
