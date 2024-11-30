'use server';

import Reminder from '../../../models/Reminder';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { handleServerErrorMessage } from '../../../utilities';
const jwtSecret = process.env.JWT_SECRET;

export default async function deleteReminder(userId, id) {
  // check that cookie user id matches param userId
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

  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  try {
    await Reminder.deleteOne({ _id: id });
    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
