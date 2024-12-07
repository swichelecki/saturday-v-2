'use server';

import connectDB from '../../config/db';
import User from '../../models/User';
import { cookies, headers } from 'next/headers';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { handleServerErrorMessage } from '../../utilities';
import { Resend } from 'resend';
import { UserCreatedEmail } from '../../components';
import { createUserSchema } from '../../schemas/schemas';
const jwtSecret = process.env.JWT_SECRET;
const resendApiKey = process.env.RESEND_API_KEY;

export default async function createUserAccount(formData) {
  if (!(formData instanceof FormData)) {
    return {
      status: 400,
      error: 'Not FormData',
    };
  }

  // check that data shape is correct
  const createUserSchemaValidated = createUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  const { success, error: zodValidationError } = createUserSchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    // create new user object
    await connectDB();

    const headerList = await headers();

    const email = formData.get('email');
    const password = formData.get('password');

    const userExists = await User.findOne({ email });

    if (userExists) return { status: 409 };

    let ipAddress = headerList.get('x-forwarded-for')?.split(',')[0];

    if (!ipAddress) ipAddress = headerList.get('x-real-ip') || 'unknown';

    // if localhost use America/Chicago ip address
    if (ipAddress === '::1') ipAddress = '73.111.204.162';

    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=timezone,continent,country,regionName,city`
    );
    const locationData = await response.json();
    const { timezone, continent, country, regionName, city } = locationData;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      email,
      password: hashedPassword,
      timezone,
      admin: false,
      newUser: true,
    });

    // create logged-in-user cookie
    const token = await new SignJWT({
      hasToken: true,
      id: user._id,
      timezone,
      admin: false,
      newUser: true,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(new TextEncoder().encode(jwtSecret));
    (await cookies()).set('saturday', token);

    // send new-user email
    const resend = new Resend(resendApiKey);

    const { error } = await resend.emails.send({
      from: 'Saturday <contact@saturdaysimplelife.com>',
      to: 'swichelecki@gmail.com',
      subject: 'Saturday User Account Created',
      react: UserCreatedEmail({
        email,
        timezone,
        continent,
        country,
        regionName,
        city,
      }),
    });

    if (error) console.error('Resend error: ', error);

    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
