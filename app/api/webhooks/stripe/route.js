import { stripe } from '../../../../lib/stripe';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/db';
import User from '../../../../models/User';
import { headers, cookies } from 'next/headers';
import { SignJWT } from 'jose';
const jwtSecret = process.env.JWT_SECRET;

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

    (await cookies()).delete('saturday');

    const token = await new SignJWT({
      hasToken: true,
      id: updatedUser._id,
      timezone: updatedUser.timezone,
      admin: updatedUser.admin,
      newUser: updatedUser.newUser,
      newNotesUser: updatedUser.newNotesUser,
      customerId: updatedUser.customerId,
      isSubscribed: updatedUser.isSubscribed,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(new TextEncoder().encode(jwtSecret));
    (await cookies()).set('saturday', token);

    // TODO: send email to me that someone subscribed

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
      console.log('User canceled subscription successfully');
    }
  }

  return new NextResponse('Webhook executed successfully', { status: 200 });
}
