'use server';

import User from '../../models/User';
import Task from '../../models/Task';
import Reminder from '../../models/Reminder';
import Category from '../../models/Category';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { handleServerErrorMessage } from '../../utilities';
import { deleteAccountSchema } from '../../schemas/schemas';
const jwtSecret = process.env.JWT_SECRET;

export default async function deleteUserAccount(formData) {
  if (!(formData instanceof FormData)) {
    return {
      status: 400,
      error: 'Not FormData',
    };
  }

  // check that cookie user id matches FormData user id
  const token = (await cookies()).get('saturday');
  let cookieUserId;

  if (token) {
    try {
      const { payload } = await jwtVerify(
        token?.value,
        new TextEncoder().encode(jwtSecret)
      );
      if (payload?.id) {
        cookieUserId = payload?.id;
      }
    } catch (error) {
      const errorMessage = handleServerErrorMessage(error);
      console.error(errorMessage);
      return { status: 500, error: errorMessage };
    }
  }

  if (!formData.get('userId') || formData.get('userId') !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const deleteAccountSchemaValidated = deleteAccountSchema.safeParse({
    userId: formData.get('userId'),
    deleteEmail: formData.get('deleteEmail'),
    deletePassword: formData.get('deletePassword'),
    deleteConfirmation: formData.get('deleteConfirmation'),
  });

  const { success, error: zodValidationError } = deleteAccountSchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    const userId = formData.get('userId');
    const email = formData.get('deleteEmail');
    const password = formData.get('deletePassword');

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      await Task.deleteMany({ userId });
      await Reminder.deleteMany({ userId });
      await Category.deleteMany({ userId });
      await User.deleteOne({ _id: userId });
      (await cookies()).delete('saturday');

      return { status: 200 };
    } else {
      return { status: 403 };
    }
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
