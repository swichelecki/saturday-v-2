'use server';

import Note from '../../models/Note';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';

export default async function pinNote(id, userId, pinnedStatus, year) {
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
    const pinnedNoteKey = 'pinned';
    const type = pinnedStatus ? pinnedNoteKey : year;
    const pinnedDate = new Date().toISOString();
    await Note.updateOne(
      { _id: id },
      { pinned: pinnedStatus, pinnedDate, type }
    );
    const result = await Note.find({ _id: id });
    revalidatePath('/notes');
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
