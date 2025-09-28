'use server';

import connectDB from '../../config/db';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { handleServerErrorMessage } from '../../utilities';
import { Resend } from 'resend';
import { UserResetPasswordEmail } from '../../components';
import { requestPasswordResetSchema } from '../../schemas/schemas';
const resendApiKey = process.env.RESEND_API_KEY;

export default async function requestUserPasswordReset(formData) {
  if (!(formData instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that data shape is correct
  const zodValidationResults = requestPasswordResetSchema.safeParse(formData);

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

    const { email } = zodData;

    const user = await User.findOne({ email });

    if (!user) return { status: 404 };

    const { email: userEmail, _id } = user;

    // encrypt user id
    const salt = await bcrypt.genSalt(10);
    const hashedUserId = await bcrypt.hash(_id.toString(), salt);

    // set updatedAt to current time for request expiration
    const date = new Date();
    const dateToISO = date.toISOString();
    await User.updateOne(
      { _id: _id },
      {
        updatedAt: dateToISO,
      }
    );

    // send reset user email
    const resend = new Resend(resendApiKey);

    const { error } = await resend.emails.send({
      from: 'Saturday <contact@saturdaysimplelife.com>',
      to: userEmail,
      subject: 'Reset User Password - Saturday',
      react: UserResetPasswordEmail({
        hashedUserId,
        email,
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
