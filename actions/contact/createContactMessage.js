'use server';

import { Resend } from 'resend';
import { ContactFormEmail } from '../../components';
import { handleServerErrorMessage } from '../../utilities';
const resendApiKey = process.env.RESEND_API_KEY;

export default async function createContactMessage(formData) {
  const { email, subject, message } = Object.fromEntries(formData);

  try {
    const resend = new Resend(resendApiKey);

    const { error } = await resend.emails.send({
      from: 'Saturday <contact@saturdaysimplelife.com>',
      to: 'swichelecki@gmail.com',
      subject,
      react: ContactFormEmail({
        email,
        message,
      }),
    });

    if (error) {
      console.log(error);
      const errorMessage = handleServerErrorMessage(error);
      return { status: 500, error: errorMessage };
    }

    return { status: 200 };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
