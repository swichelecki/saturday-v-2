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
  let admin;
  let cookieError;

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
      admin = payload?.admin;
    }
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    cookieError = { status: 500, error: errorMessage };
  }

  return { user, userId, timezone, newUser, admin, cookieError };
};
