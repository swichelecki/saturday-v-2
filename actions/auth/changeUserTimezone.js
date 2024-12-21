'use server';

import User from '../../models/User';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { changeTimezoneSchema } from '../../schemas/schemas';
const jwtSecret = process.env.JWT_SECRET;

export default async function changeUserTimezone(formData) {
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
  const changeTimezoneSchemaValidated = changeTimezoneSchema.safeParse({
    userId: formData.get('userId'),
    timezone: formData.get('timezone'),
    currentTimezone: formData.get('currentTimezone'),
  });

  const { success, error: zodValidationError } = changeTimezoneSchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    const timezone = formData.get('timezone');
    const userId = formData.get('userId');

    await User.updateOne(
      { _id: userId },
      {
        timezone,
      }
    );

    const userUpdated = await User.findOne({ _id: userId });

    (await cookies()).delete('saturday');

    const token = await new SignJWT({
      hasToken: true,
      id: userUpdated._id,
      timezone: userUpdated.timezone,
      admin: userUpdated.admin,
      newUser: userUpdated.newUser,
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
