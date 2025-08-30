'use server';

import connectDB from '../../config/db';
import User from '../../models/User';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { User2FactorAuthEmail } from '../../components';
import { handleServerErrorMessage } from '../../utilities';
import { loginSchema } from '../../schemas/schemas';
const resendApiKey = process.env.RESEND_API_KEY;

export default async function request2FactorAuthentication(formData) {
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

  const getRandom6DigitNumber = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  try {
    await connectDB();

    const { email, password } = zodData;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // set updatedAt to current time for request expiration
      const date = new Date();
      const dateToISO = date.toISOString();
      const twoFactorAuthCode = getRandom6DigitNumber();

      // encrypt 2-factor auth verification code
      const salt = await bcrypt.genSalt(10);
      const hashedtwoFactorAuthCode = await bcrypt.hash(
        twoFactorAuthCode.toString(),
        salt
      );

      await User.updateOne(
        { _id: user._id },
        {
          updatedAt: dateToISO,
          twoFactorAuthCode: hashedtwoFactorAuthCode,
        }
      );

      // send reset user email
      const resend = new Resend(resendApiKey);

      const { error } = await resend.emails.send({
        from: 'Saturday <contact@saturdaysimplelife.com>',
        to: email,
        subject: `Saturday Verification Code: ${twoFactorAuthCode}`,
        react: User2FactorAuthEmail({
          twoFactorAuthCode,
        }),
      });

      if (error) console.error('Resend error: ', error);

      return { status: 200 };
    }

    return { status: 403 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
