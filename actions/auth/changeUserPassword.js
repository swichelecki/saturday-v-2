'use server';

import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export default async function userChangePassword(formData) {
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

      cookies().delete('saturday');
      return { status: 200 };
    } else {
      return { status: 400 };
    }
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
}
