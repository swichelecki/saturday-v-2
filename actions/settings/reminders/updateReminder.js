'use server';

import Reminder from '../../../models/Reminder';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { handleServerErrorMessage } from '../../../utilities';
import { reminderSchema } from '../../../schemas/schemas';
const jwtSecret = process.env.JWT_SECRET;

export default async function updateReminder(formData) {
  if (!(formData instanceof FormData)) {
    return {
      status: 400,
      error: 'Not FormData',
    };
  }

  // check that cookie user id matches FormData user id
  const token = (await cookies()).get('saturday');
  let cookieUserId;

  if (token) {
    try {
      const { payload } = await jwtVerify(
        token?.value,
        new TextEncoder().encode(jwtSecret)
      );
      if (payload?.id) {
        cookieUserId = payload?.id;
      }
    } catch (error) {
      const errorMessage = handleServerErrorMessage(error);
      console.error(errorMessage);
      return { status: 500, error: errorMessage };
    }
  }

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
    reminder: formData.get('reminder'),
    reminderDate: formData.get('reminderDate'),
    recurrenceInterval: formData.get('recurrenceInterval'),
    exactRecurringDate: formData.get('exactRecurringDate'),
    recurrenceBuffer: formData.get('recurrenceBuffer'),
    displayReminder: formData.get('displayReminder'),
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
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
