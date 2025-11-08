'use server';

import connectDB from '../../config/db';
import User from '../../models/User';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import {
  handleServerErrorMessage,
  getRandom6DigitNumber,
} from '../../utilities';
import { Resend } from 'resend';
import { UserCreatedEmail, User2FactorAuthEmail } from '../../components';
import { createUserSchema } from '../../schemas/schemas';
const resendApiKey = process.env.RESEND_API_KEY;

export default async function createUserAccount(formData) {
  if (!(formData instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that data shape is correct
  const zodValidationResults = createUserSchema.safeParse(formData);

  const {
    data: zodData,
    success,
    error: zodValidationError,
  } = zodValidationResults;
  if (!success) {
    console.error(zodValidationError);
    return {
      status: 400,
      error: 'Zod validation failed. Check server console.',
    };
  }

  try {
    await connectDB();

    const headerList = await headers();
    const { email, password } = zodData;

    const userExists = await User.findOne({ email });
    if (userExists) return { status: 409 };

    // get user location information
    let ipAddress = headerList.get('x-forwarded-for')?.split(',')[0];
    if (!ipAddress) ipAddress = headerList.get('x-real-ip') || 'unknown';
    // if localhost use America/Chicago ip address
    if (ipAddress === '::1') ipAddress = '73.111.204.162';

    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=timezone,continent,country,regionName,city`
    );
    const locationData = await response.json();
    const { timezone, continent, country, regionName, city } = locationData;

    // check that it's not spam - getting spammed and IPs don't match
    const bannedCities = ['Amsterdam', 'Moscow'];
    if (bannedCities.includes(city)) return { status: 403, error: 'Forbidden' };

    // encrypt 2-factor auth verification code
    const twoFactorAuthCode = getRandom6DigitNumber();
    const twoFactorAuthSalt = await bcrypt.genSalt(10);
    const hashedtwoFactorAuthCode = await bcrypt.hash(
      twoFactorAuthCode.toString(),
      twoFactorAuthSalt
    );

    const passwordSsalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, passwordSsalt);
    await User.create({
      email,
      password: hashedPassword,
      timezone,
      twoFactorAuthCode: hashedtwoFactorAuthCode,
    });

    // send new-user email to admin
    const resend = new Resend(resendApiKey);

    const { error: errorNewUserLogin } = await resend.emails.send({
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
        ipAddress,
      }),
    });

    if (errorNewUserLogin) console.error('Resend error: ', errorNewUserLogin);

    // send verification code email
    const { error: errorNotifyAdmin } = await resend.emails.send({
      from: 'Saturday <contact@saturdaysimplelife.com>',
      to: email,
      subject: `Saturday Verification Code: ${twoFactorAuthCode}`,
      react: User2FactorAuthEmail({
        twoFactorAuthCode,
      }),
    });

    if (errorNotifyAdmin) console.error('Resend error: ', errorNotifyAdmin);

    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
