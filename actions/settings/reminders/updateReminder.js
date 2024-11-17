'use server';

import Reminder from '../../../models/Reminder';
import { handleServerErrorMessage } from '../../../utilities';

export default async function updateReminder(formData) {
  try {
    const {
      _id,
      userId,
      reminder,
      reminderDate,
      recurrenceInterval,
      recurrenceBuffer,
      exactRecurringDate,
      displayReminder,
    } = Object.fromEntries(formData);

    await Reminder.updateOne(
      { _id: _id },
      {
        userId,
        reminder,
        reminderDate,
        recurrenceInterval,
        recurrenceBuffer,
        exactRecurringDate,
        displayReminder,
      }
    );

    const result = await Reminder.find({ _id: _id });

    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
