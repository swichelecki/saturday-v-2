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
  if (!(formData instanceof FormData)) {
    return {
      status: 400,
      error: 'Not FormData',
    };
  }

  // check that data shape is correct
  const loginDataValidated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  const { success } = loginDataValidated;
  if (!success) return { status: 400, error: 'Invalid FormData' };

  try {
    await connectDB();

    const email = formData.get('email');
    const password = formData.get('password');

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await new SignJWT({
        hasToken: true,
        id: user._id,
        timezone: user.timezone,
        admin: user.admin,
        newUser: user.newUser,
      })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(new TextEncoder().encode(jwtSecret));
      (await cookies()).set('saturday', token);
      return { status: 200 };
    } else {
      return { status: 403 };
    }
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
