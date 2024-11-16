'use server';

import User from '../../models/User';
import Task from '../../models/Task';
import Reminder from '../../models/Reminder';
import Category from '../../models/Category';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../utilities';

export default async function deleteUserAccount(formData) {
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
      revalidatePath('/');

      return { status: 200 };
    } else {
      return { status: 403 };
    }
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
