'use server';

import Task from '../../models/Task';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { handleServerErrorMessage } from '../../utilities';
import { itemFormDataSchema } from '../../schemas/schemas';
const jwtSecret = process.env.JWT_SECRET;

export default async function createItem(formData) {
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
  const itemFormDataSchemaValidated = itemFormDataSchema.safeParse({
    _id: formData.get('_id'),
    userId: formData.get('userId'),
    title: formData.get('title'),
    column: formData.get('column'),
    priority: formData.get('priority'),
    type: formData.get('type'),
    description: formData.get('description'),
    date: formData.get('date'),
    dateAndTime: formData.get('dateAndTime'),
    mandatoryDate: formData.get('mandatoryDate'),
    confirmDeletion: formData.get('confirmDeletion'),
  });

  const { success } = itemFormDataSchemaValidated;
  if (!success) return { status: 400, error: 'Invalid FormData' };

  const {
    title,
    description,
    date,
    dateAndTime,
    userId,
    priority,
    type,
    column,
    confirmDeletion,
    mandatoryDate,
  } = Object.fromEntries(formData);

  try {
    const result = await Task.create({
      userId,
      title,
      description,
      date,
      dateAndTime,
      priority,
      type,
      column,
      confirmDeletion,
      mandatoryDate,
    });

    return { status: 200, item: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
