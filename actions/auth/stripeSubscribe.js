'use server';

import { stripe } from '../../lib/stripe';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';

export default async function stripeSubscribe(userId, email) {
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
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/payments/cancel`,
    });

    return { status: 200, url };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
