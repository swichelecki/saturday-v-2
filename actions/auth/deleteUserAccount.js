'use server';

import User from '../../models/User';
import Task from '../../models/Task';
import Reminder from '../../models/Reminder';
import Category from '../../models/Category';
import Note from '../../models/Note';
import { stripe } from '../../lib/stripe';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { deleteAccountSchema } from '../../schemas/schemas';
import { UserDeletedEmail } from '../../components';

export default async function deleteUserAccount(formData) {
  if (!(formData instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  const { userId } = formData;
  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const zodValidationResults = deleteAccountSchema.safeParse(formData);

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
    const { userId, deleteEmail: email, deletePassword: password } = zodData;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      await Task.deleteMany({ userId });
      await Reminder.deleteMany({ userId });
      await Category.deleteMany({ userId });
      await Note.deleteMany({ userId });
      await User.deleteOne({ _id: userId });
      (await cookies()).delete('saturday');

      // cancel stripe subscription if one exists
      const existingCustomer = await stripe.customers.list({ email, limit: 1 });
      let customerId =
        existingCustomer.data.length > 0 ? existingCustomer.data[0].id : null;

      if (customerId) {
        const customerWithSubscriptions = await stripe.customers.retrieve(
          customerId,
          { expand: ['subscriptions'] }
        );

        if (customerWithSubscriptions.subscriptions.data.length > 0) {
          const subscriptionId =
            customerWithSubscriptions.subscriptions.data[0].id;
          const canceledSubscription = await stripe.subscriptions.cancel(
            subscriptionId
          );
          console.log(
            `Subscription with id of ${canceledSubscription.id} canceled`
          );
        }
      }

      // send user deleted email
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { error } = await resend.emails.send({
        from: 'Saturday <contact@saturdaysimplelife.com>',
        to: 'swichelecki@gmail.com',
        subject: 'Saturday User Account Deleted',
        react: UserDeletedEmail({
          email,
          customerId,
          createdAt: user.createdAt.toString(),
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
