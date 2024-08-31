'use server';

import User from '../../models/User';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { handleServerErrorMessage } from '../../utilities';
const jwtSecret = process.env.JWT_SECRET;

export default async function changeUserTimezone(formData) {
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

    cookies().delete('saturday');

    const token = await new SignJWT({
      hasToken: true,
      id: userUpdated._id,
      timezone: userUpdated.timezone,
      newUser: userUpdated.newUser,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(new TextEncoder().encode(jwtSecret));
    cookies().set('saturday', token);
    return { status: 200 };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
