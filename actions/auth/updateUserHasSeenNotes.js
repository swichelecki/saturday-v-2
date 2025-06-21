'use server';

//import connectDB from '../../config/db';
import User from '../../models/User';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
const jwtSecret = process.env.JWT_SECRET;

export default async function updateUserHasSeenNotes(userId) {
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
    //await connectDB();

    await User.updateOne(
      { _id: userId },
      {
        newNotesUser: false,
      }
    );

    const { _id, timezone, admin, newUser, newNotesUser } = await User.findOne({
      _id: userId,
    });

    (await cookies()).delete('saturday');

    const token = await new SignJWT({
      hasToken: true,
      id: _id,
      timezone,
      admin,
      newUser,
      newNotesUser,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(new TextEncoder().encode(jwtSecret));
    (await cookies()).set('saturday', token);
    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
