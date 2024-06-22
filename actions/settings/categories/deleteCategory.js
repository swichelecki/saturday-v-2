'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
//import { revalidatePath } from 'next/cache';

export default async function deleteCategory(userId, _id) {
  try {
    const category = await Category.findOne({ _id });
    const { type } = category;
    await Task.deleteMany({ type, userId });
    await Category.deleteOne({ _id: _id });
    //revalidatePath('/settings');

    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 200 };
  }
}
