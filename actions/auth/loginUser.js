'use server';

import connectDB from '../../config/db';
import User from '../../models/User';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { handleServerErrorMessage } from '../../utilities';
const jwtSecret = process.env.JWT_SECRET;

export default async function loginUser(formData) {
  try {
    await connectDB();

    const email = formData.get('email');
    const password = formData.get('password');

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await new SignJWT({ hasToken: true, id: user._id })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(new TextEncoder().encode(jwtSecret));
      cookies().set('saturday', token);
      return { status: 200 };
    } else {
      return { status: 403 };
    }
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
