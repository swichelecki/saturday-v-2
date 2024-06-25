'use server';

import User from '../../models/User';
import Task from '../../models/Task';
import Reminder from '../../models/Reminder';
import Category from '../../models/Category';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export default async function deleteUserAccount(formData) {
  try {
    const userId = formData.get('userId');
    const email = formData.get('email');
    const password = formData.get('password');

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      await Task.deleteMany({ userId });
      await Reminder.deleteMany({ userId });
      await Category.deleteMany({ userId });
      await User.deleteOne({ _id: userId });
      cookies().delete('saturday');

      return { status: 200 };
    } else {
      return { status: 403 };
    }
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
}
