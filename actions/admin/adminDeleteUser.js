'use server';

import connectDB from '../../config/db';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { adminDeleteUserSchema } from '../../schemas/schemas';

export default async function adminDeleteUser(password, adminId, userId) {
  if (
    typeof password !== 'string' ||
    typeof adminId !== 'string' ||
    typeof userId !== 'string'
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
      // TODO: delete user and revalidate path
      return { status: 200 };
    }

    return { status: 403 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
