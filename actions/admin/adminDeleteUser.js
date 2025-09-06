'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '../../config/db';
import User from '../../models/User';
import Task from '../../models/Task';
import Reminder from '../../models/Reminder';
import Category from '../../models/Category';
import Note from '../../models/Note';
import { stripe } from '../../lib/stripe';
import bcrypt from 'bcryptjs';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { adminDeleteUserSchema } from '../../schemas/schemas';

export default async function adminDeleteUser(
  password,
  adminId,
  userId,
  userEmail
) {
  if (
    typeof password !== 'string' ||
    typeof adminId !== 'string' ||
    typeof userId !== 'string' ||
    typeof userEmail !== 'string'
  ) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that cookie user id matches admin id
  const { userId: cookieAdminId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!adminId || adminId !== cookieAdminId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const zodValidationResults = adminDeleteUserSchema.safeParse({ password });

  const {
    data: zodPassword,
    success,
    error: zodValidationError,
  } = zodValidationResults;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    await connectDB();

    const { password } = zodPassword;
    const admin = await User.findOne({ _id: adminId });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      await Task.deleteMany({ userId });
      await Reminder.deleteMany({ userId });
      await Category.deleteMany({ userId });
      await Note.deleteMany({ userId });
      await User.deleteOne({ _id: userId });

      // cancel stripe subscription if one exists
      const existingCustomer = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
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

      revalidatePath('/admin');

      return { status: 200 };
    }

    return { status: 403 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
