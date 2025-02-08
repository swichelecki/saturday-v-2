'server-only';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { handleServerErrorMessage } from './';
const jwtSecret = process.env.JWT_SECRET;

export const getUserFromCookie = async () => {
  const token = (await cookies()).get('saturday');
  let user = false;
  let userId;
  let timezone;
  let newUser;
  let newNotesUser;
  let admin;
  let cookieError = false;

  if (!token) return { user };

  try {
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(jwtSecret)
    );

    if (payload.hasToken) {
      user = true;
      userId = payload?.id;
      timezone = payload?.timezone;
      newUser = payload?.newUser;
      newNotesUser = payload?.newNotesUser;
      admin = payload?.admin;
    }
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    cookieError = { status: 500, error: errorMessage };
  }

  return { user, userId, timezone, newUser, newNotesUser, admin, cookieError };
};
