'use server';

import Reminder from '../../../models/Reminder';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { reminderSchema } from '../../../schemas/schemas';

export default async function updateReminder(formData) {
  if (!(formData instanceof FormData)) {
    return {
      status: 400,
      error: 'Not FormData',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!formData.get('userId') || formData.get('userId') !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const numberOfItems = await Reminder.find({ userId: cookieUserId }).count();
  const reminderSchemaValidated = reminderSchema.safeParse({
    _id: formData.get('_id'),
    userId: formData.get('userId'),
    title: formData.get('title'),
    reminderDate: formData.get('reminderDate'),
    recurrenceInterval: formData.get('recurrenceInterval'),
    exactRecurringDate: formData.get('exactRecurringDate'),
    recurrenceBuffer: formData.get('recurrenceBuffer'),
    displayReminder: formData.get('displayReminder'),
    confirmDeletion: formData.get('confirmDeletion'),
    itemLimit: numberOfItems - 1,
  });

  const { success, error: zodValidationError } = reminderSchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
  }

  try {
    const {
      _id,
      userId,
      title,
      reminderDate,
      recurrenceInterval,
      recurrenceBuffer,
      exactRecurringDate,
      displayReminder,
      confirmDeletion,
    } = Object.fromEntries(formData);

    await Reminder.updateOne(
      { _id: _id },
      {
        userId,
        title,
        reminderDate,
        recurrenceInterval,
        recurrenceBuffer,
        exactRecurringDate,
        displayReminder,
        confirmDeletion,
      }
    );

    const result = await Reminder.find({ _id: _id });
    revalidatePath('/settings');
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
