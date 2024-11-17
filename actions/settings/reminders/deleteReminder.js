'use server';

import Reminder from '../../../models/Reminder';
import { handleServerErrorMessage } from '../../../utilities';

export default async function deleteReminder(id) {
  try {
    await Reminder.deleteOne({ _id: id });
    return { status: 200 };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
