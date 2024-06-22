'use server';

import Reminder from '../../../models/Reminder';
//import { revalidatePath } from 'next/cache';

export default async function deleteReminder(id) {
  try {
    await Reminder.deleteOne({ _id: id });
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
}
