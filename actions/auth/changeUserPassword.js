'use server';

import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { changePasswordSchema } from '../../schemas/schemas';

export default async function changeUserPassword(formData) {
  if (!(formData instanceof FormData)) {
    return {
      status: 400,
      error: 'Not FormData',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!formData.get('userId') || formData.get('userId') !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const changePasswordSchemaValidated = changePasswordSchema.safeParse({
    userId: formData.get('userId'),
    email: formData.get('email'),
    password: formData.get('password'),
    newPassword: formData.get('newPassword'),
    confirmNewPassword: formData.get('confirmNewPassword'),
  });

  const { success, error: zodValidationError } = changePasswordSchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    const userId = formData.get('userId');
    const email = formData.get('email');
    const password = formData.get('password');
    const newPassword = formData.get('newPassword');

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await User.updateOne(
        { _id: userId },
        {
          password: hashedPassword,
        }
      );

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
