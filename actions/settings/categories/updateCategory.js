'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
//import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../../utilities';

export default async function updateCategory(item) {
  try {
    const { _id, userId, priority, type, mandatoryDate } = item;
    const newItemColumn = priority;

    await Category.updateOne(
      { _id: _id },
      {
        userId,
        priority,
        type,
        mandatoryDate,
      }
    );

    const itemsOfCategoryType = await Task.find({ type, userId });

    itemsOfCategoryType.forEach(async (item) => {
      const {
        _id,
        priority,
        title,
        description,
        confirmDeletion,
        date,
        dateAndTime,
      } = item;

      await Task.updateOne(
        { _id: _id },
        {
          priority,
          column: newItemColumn,
          title,
          description,
          confirmDeletion,
          date,
          dateAndTime,
        }
      );
    });

    //revalidatePath('/dashboard');

    return { status: 200 };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
