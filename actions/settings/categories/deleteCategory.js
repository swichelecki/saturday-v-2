'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { handleServerErrorMessage } from '../../../utilities';
const jwtSecret = process.env.JWT_SECRET;

export default async function deleteCategory(userId, _id) {
  // check that cookie user id matches param userId
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

  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  try {
    const category = await Category.findOne({ _id });
    const { type } = category;
    await Task.deleteMany({ type, userId });
    await Category.deleteOne({ _id: _id });

    return { status: 200 };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
