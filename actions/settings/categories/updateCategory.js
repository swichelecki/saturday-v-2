'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { categorySchema } from '../../../schemas/schemas';

export default async function updateCategory(item, isFormUpdate) {
  if (!(item instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  const { userId, title } = item;
  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  if (isFormUpdate) {
    const categoryExists = await Category.findOne({ userId, title });
    if (categoryExists) return { status: 409 };
  }

  // check that data shape is correct
  const numberOfItems = await Category.find({ userId: cookieUserId }).count();
  const zodValidationResults = categorySchema.safeParse({
    ...item,
    itemLimit: numberOfItems,
  });

  const {
    data: zodData,
    success,
    error: zodValidationError,
  } = zodValidationResults;
  if (!success) {
    console.error(zodValidationError);
    return {
      status: 400,
      error: 'Zod validation failed. Check server console.',
    };
  }

  try {
    // update category - either by draggig to change order in list or using update modal
    const {
      _id: categoryId,
      userId: categoryUserId,
      priority: categoryPriority,
      title: categoryTitle,
      mandatoryDate: categoryMandatoryDate,
      confirmDeletion: categoryConfirmDeletion,
    } = zodData;

    await Category.updateOne(
      { _id: categoryId },
      {
        userId: categoryUserId,
        priority: categoryPriority,
        title: categoryTitle,
        mandatoryDate: categoryMandatoryDate,
        confirmDeletion: categoryConfirmDeletion,
      }
    );

    let updatedCategory;
    if (isFormUpdate)
      updatedCategory = await Category.find({ _id: categoryId });

    // update all tasks associated with category
    const itemsOfCategoryType = await Task.find({
      categoryId,
      userId: categoryUserId,
    });

    itemsOfCategoryType.forEach(async (item) => {
      const {
        _id,
        userId,
        categoryId,
        priority,
        title,
        description,
        confirmDeletion,
        date,
        dateAndTime,
        mandatoryDate,
      } = item;

      await Task.updateOne(
        { _id: _id },
        {
          userId,
          categoryId,
          priority,
          column: categoryPriority,
          type: categoryTitle,
          title,
          description,
          confirmDeletion,
          date: isFormUpdate ? (categoryMandatoryDate ? date : '') : date,
          dateAndTime: isFormUpdate
            ? categoryMandatoryDate
              ? dateAndTime
              : ''
            : dateAndTime,
          mandatoryDate: isFormUpdate ? categoryMandatoryDate : mandatoryDate,
        }
      );
    });

    revalidatePath('/settings');
    return {
      status: 200,
      item: isFormUpdate ? JSON.parse(JSON.stringify(updatedCategory[0])) : '',
    };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
