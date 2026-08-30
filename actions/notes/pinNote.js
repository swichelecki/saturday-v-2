'use server';

import Note from '../../models/Note';
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
    const pinnedNoteKey = 'Pinned';
    const type = pinnedStatus ? pinnedNoteKey : year;
    const pinnedDate = new Date().toISOString();
    const { matchedCount } = await Note.updateOne(
      { _id: id, userId: cookieUserId },
      { pinned: pinnedStatus, pinnedDate, type },
    );

    if (!matchedCount) {
      return { status: 404, error: 'Note not found' };
    }

    const result = await Note.find({ _id: id, userId: cookieUserId });
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
