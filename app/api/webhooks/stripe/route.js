import { stripe } from '../../../../lib/stripe';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/db';
import User from '../../../../models/User';
import { headers } from 'next/headers';

export async function POST(request) {
  await connectDB();

  const body = await request.text();
  const signature = (await headers()).get('Stripe-Signature');
  let event;
  let data;
  let eventType;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log(error);
    return new NextResponse('Error occured in webhook', { status: 400 });
  }

  data = event.data;
  eventType = event.type;

  if (eventType === 'checkout.session.completed') {
    const session = await stripe.checkout.sessions.retrieve(data.object.id, {
      expand: ['line_items'],
    });

    const customerId = session.customer;
    const priceId = session.line_items.data[0].price.id;
    const metadata = data.object.metadata;

    if (priceId !== process.env.STRIPE_PRICE_ID) {
      return new NextResponse('Price ID does not match', { status: 400 });
    }

    const userId = metadata.userId;
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        isSubscribed: true,
        customerId,
      }
    );

    if (!updatedUser) {
      return new NextResponse('User not found', { status: 400 });
    } else {
      console.log('User subscribed successfully');
    }
  }

  if (eventType === 'customer.subscription.deleted') {
    const subscription = data.object;
    const customerId = subscription.customer;
    const priceId = subscription.items.data[0].price.id;

    if (priceId !== process.env.STRIPE_PRICE_ID) {
      return new NextResponse('Price ID does not match', { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { customerId },
      {
        isSubscribed: false,
      }
    );

    if (!updatedUser) {
      return new NextResponse('User not found', { status: 400 });
    } else {
      console.log('User Subscription Canceled');
    }
  }

  return new NextResponse('Webhook executed successfully', { status: 200 });
}
