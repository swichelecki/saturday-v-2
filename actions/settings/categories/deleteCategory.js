'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../../utilities';

export default async function deleteCategory(userId, _id) {
  try {
    const category = await Category.findOne({ _id });
    const { type } = category;
    await Task.deleteMany({ type, userId });
    await Category.deleteOne({ _id: _id });
    revalidatePath('/');

    return { status: 200 };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
