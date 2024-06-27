'use server';

import Task from '../../models/Task';
import { handleServerErrorMessage } from '../../utilities';

export default async function getItem(id) {
  try {
    const result = await Task.find({ _id: id });
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
