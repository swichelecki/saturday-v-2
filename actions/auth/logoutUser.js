'use server';

import { cookies } from 'next/headers';
import { handleServerErrorMessage } from '../../utilities';

export default async function logoutUser() {
  try {
    (await cookies()).delete('saturday');
    return { status: 200 };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
