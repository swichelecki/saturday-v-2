'use server';

import Reminder from '../../../models/Reminder';
//import { revalidatePath } from 'next/cache';

export default async function getReminder(id) {
  try {
    const result = await Reminder.find({ _id: id });
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
}
