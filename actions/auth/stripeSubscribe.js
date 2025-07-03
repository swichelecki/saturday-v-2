'use server';

import { stripe } from '../../lib/stripe';
import User from '../../models/User';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
const stripeManageSubscriptionUrl = process.env.STRIPE_CUSTOMER_PORTAL;

export default async function stripeSubscribe(userId) {
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
    const { email, customerId: stripeCustomerId } = user;

    if (!email) return { status: 400, error: 'User email not found' };

    // handle stripe subscribe for new user - send user to stripe checkout page
    if (!stripeCustomerId) {
      const existingCustomer = await stripe.customers.list({ email, limit: 1 });
      let customerId =
        existingCustomer.data.length > 0 ? existingCustomer.data[0].id : null;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email,
        });
        customerId = customer.id;
      }

      const { url } = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        metadata: {
          userId,
        },
        mode: 'subscription',
        billing_address_collection: 'required',
        customer_update: {
          name: 'auto',
          address: 'auto',
        },
        success_url: `${process.env.NEXT_PUBLIC_URL}/payments/success`,
      });

      return { status: 200, url };
    }

    // handle stripe unsubscribe or resubscribe - send user to stripe login page
    if (stripeCustomerId) {
      const url = `${stripeManageSubscriptionUrl}?prefilled_email=${email}`;

      return { status: 200, url };
    }
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
