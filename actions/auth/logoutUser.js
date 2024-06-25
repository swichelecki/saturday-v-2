'use server';

import { cookies } from 'next/headers';

export default async function logoutUser() {
  try {
    cookies().delete('saturday');
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
}
