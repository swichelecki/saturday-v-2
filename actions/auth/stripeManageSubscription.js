'use server';

import User from '../../models/User';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
const stripeManageSubscriptionUrl =
  process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL;

export default async function stripeManageSubscription(userId) {
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
    const user = await User.findOne({ _id: userId });
    const { email } = user;

    if (!email) return { status: 400, error: 'User email not found' };

    const url = `${stripeManageSubscriptionUrl}?prefilled_email=${email}`;

    return { status: 200, url };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
