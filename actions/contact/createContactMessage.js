'use server';

import { Resend } from 'resend';
import { ContactFormEmail } from '../../components';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { contactFormSchema } from '../../schemas/schemas';
const resendApiKey = process.env.RESEND_API_KEY;

export default async function createContactMessage(formData) {
  if (!(formData instanceof FormData)) {
    return {
      status: 400,
      error: 'Not FormData',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!formData.get('userId') || formData.get('userId') !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const contactFormValidated = contactFormSchema.safeParse({
    userId: formData.get('userId'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  const { success, error: zodValidationError } = contactFormValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    const { email, subject, message } = Object.fromEntries(formData);

    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: 'Saturday <contact@saturdaysimplelife.com>',
      to: 'swichelecki@gmail.com',
      subject,
      react: ContactFormEmail({
        email,
        message,
      }),
    });

    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
