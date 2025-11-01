'use server';

import connectDB from '../../config/db';
import User from '../../models/User';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { handleServerErrorMessage } from '../../utilities';
import { loginSchema } from '../../schemas/schemas';
const jwtSecret = process.env.JWT_SECRET;

export default async function loginUser(formData) {
  if (!(formData instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that data shape is correct
  const zodValidationResults = loginSchema.safeParse(formData);

  const {
    data: zodData,
    success,
    error: zodValidationError,
  } = zodValidationResults;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    await connectDB();

    const { email, password, verification } = zodData;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // check that 5 minutes has not passed after 2-factor auth verification code email sent
      const updatedAtDateObj = new Date(user.updatedAt);
      const updatedAtMsec = updatedAtDateObj.getTime();
      const date = new Date();
      const currentTimeMsc = date.getTime();
      const fiveMinutesMsc = 300000;
      if (currentTimeMsc > updatedAtMsec + fiveMinutesMsc)
        return { status: 410, error: 'Verification Code Expired' };

      // check that 2-factor auth verification code matches
      if (!(await bcrypt.compare(verification, user.twoFactorAuthCode))) {
        return { status: 403, error: 'Incorrect Verification Code' };
      }

      const token = await new SignJWT({
        hasToken: true,
        id: user._id,
        timezone: user.timezone,
        admin: user.admin,
        newUser: user.newUser,
        newNotesUser: user.newNotesUser,
        isSubscribed: user.isSubscribed,
      })
        .setExpirationTime('7d')
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(new TextEncoder().encode(jwtSecret));
      (await cookies()).set('saturday', token);
      return { status: 200 };
    }

    return { status: 403 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
