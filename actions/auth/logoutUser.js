'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../utilities';

export default async function logoutUser() {
  try {
    cookies().delete('saturday');
    revalidatePath('/');
    return { status: 200 };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
