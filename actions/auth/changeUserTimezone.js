'use server';

import User from '../../models/User';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { handleServerErrorMessage } from '../../utilities';
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
  });

  const { success } = changeTimezoneSchemaValidated;
  if (!success) return { status: 400, error: 'Invalid FormData' };

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
