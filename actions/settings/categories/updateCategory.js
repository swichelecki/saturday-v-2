'use server';

import Task from '../../../models/Task';
import Category from '../../../models/Category';
import { revalidatePath } from 'next/cache';
import { handleServerErrorMessage } from '../../../utilities';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { categorySchema } from '../../../schemas/schemas';

export default async function updateCategory(item) {
  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  // item is formData when submitted from modal
  // item is an object when reordered in list
  const itemIsFormData = item instanceof FormData;
  const itemUserId = itemIsFormData ? item.get('userId') : item?.userId;

  if (!itemUserId || itemUserId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  // check that data shape is correct
  const numberOfItems = await Category.find({ userId: cookieUserId }).count();
  const categorySchemaValidated = categorySchema.safeParse({
    _id: itemIsFormData ? item.get('_id') : item?._id,
    userId: itemIsFormData ? item.get('userId') : item?.userId,
    priority: itemIsFormData ? item.get('priority') : item?.priority,
    title: itemIsFormData ? item.get('title') : item?.title,
    mandatoryDate: itemIsFormData
      ? item.get('mandatoryDate')
      : item?.mandatoryDate,
    confirmDeletion: itemIsFormData
      ? item.get('confirmDeletion')
      : item?.confirmDeletion,
    itemLimit: numberOfItems,
  });

  const { success, error: zodValidationError } = categorySchemaValidated;
  if (!success) {
    console.error(zodValidationError);
    return { status: 400, error: 'Invalid FormData. Check server console.' };
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
    } = itemIsFormData ? Object.fromEntries(item) : item;

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
    if (itemIsFormData)
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
          date: itemIsFormData
            ? categoryMandatoryDate === 'true'
              ? date
              : ''
            : date,
          dateAndTime: itemIsFormData
            ? categoryMandatoryDate === 'true'
              ? dateAndTime
              : ''
            : dateAndTime,
          mandatoryDate: itemIsFormData
            ? categoryMandatoryDate === 'true'
              ? true
              : false
            : mandatoryDate,
        }
      );
    });

    revalidatePath('/settings');
    return {
      status: 200,
      item: itemIsFormData
        ? JSON.parse(JSON.stringify(updatedCategory[0]))
        : '',
    };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
