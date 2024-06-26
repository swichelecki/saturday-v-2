'use server';

import Category from '../../../models/Category';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../../utilities';

export default async function createCategory(formData) {
  try {
    const category = Object.fromEntries(formData);
    const result = await Category.create(category);
    revalidatePath('/dashboard');

    return { status: 200, item: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
