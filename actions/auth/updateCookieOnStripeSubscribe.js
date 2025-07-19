'use server';

import User from '../../models/User';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { Resend } from 'resend';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { UserSubscriptionEmail } from '../../components';
const jwtSecret = process.env.JWT_SECRET;

export default async function updateCookieOnStripeSubscribe(userId) {
  // check that cookie user id matches param userId
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  try {
    const {
      _id,
      timezone,
      admin,
      newUser,
      newNotesUser,
      isSubscribed,
      email,
      createdAt,
    } = await User.findOne({
      _id: userId,
    });

    (await cookies()).delete('saturday');

    const token = await new SignJWT({
      hasToken: true,
      id: _id,
      timezone,
      admin,
      newUser,
      newNotesUser,
      isSubscribed,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(new TextEncoder().encode(jwtSecret));
    (await cookies()).set('saturday', token);

    // send user subscribed email
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: 'Saturday <contact@saturdaysimplelife.com>',
      to: 'swichelecki@gmail.com',
      subject: `Saturday User ${isSubscribed ? 'Subscribed' : 'Canceled'}`,
      react: UserSubscriptionEmail({
        email,
        createdAt: createdAt.toString(),
        isSubscribed,
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
