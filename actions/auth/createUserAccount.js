'use server';

import connectDB from '../../config/db';
import User from '../../models/User';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { handleServerErrorMessage } from '../../utilities';
const jwtSecret = process.env.JWT_SECRET;

export default async function createUserAccount(formData) {
  try {
    await connectDB();

    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      throw new Error('Missing required user data');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return { status: 409 };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      email,
      password: hashedPassword,
      newUser: true,
    });

    if (user) {
      const token = await new SignJWT({
        hasToken: true,
        id: user._id,
        newUser: true,
      })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(new TextEncoder().encode(jwtSecret));
      cookies().set('saturday', token);
      return { status: 200 };
    } else {
      return { status: 400 };
    }
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
