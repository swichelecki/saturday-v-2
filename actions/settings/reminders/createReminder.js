'use server';

import Reminder from '../../../models/Reminder';
//import { revalidatePath } from 'next/cache';

export default async function createReminder(formData) {
  try {
    const reminder = Object.fromEntries(formData);
    const result = await Reminder.create(reminder);
    return { status: 200, item: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
}
