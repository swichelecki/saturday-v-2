'use server';

import Task from '../../models/Task';
import Reminder from '../../models/Reminder';
import Holiday from '../../models/Holiday';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';

export default async function getCalendarItems(queryData) {
  if (!(queryData instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that cookie user id matches FormData user id
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  const {
    nextOrPrevMondayYearMonthDay: monday,
    nextOrPrevSundayYearMonthDay: sunday,
    userId,
  } = queryData;

  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  try {
    const [tasksRaw, remindersRaw, holidaysRaw] = await Promise.all([
      Task.find({ userId, date: { $gte: monday, $lte: sunday } }),
      Reminder.find({
        userId,
        exactRecurringDate: true,
        reminderDate: {
          $gte: monday,
          $lte: sunday,
        },
      }),
      Holiday.find({
        date: {
          $gte: monday,
          $lte: sunday,
        },
      }),
    ]);

    return {
      status: 200,
      calendarItems: [
        ...JSON.parse(JSON.stringify(tasksRaw)),
        ...JSON.parse(JSON.stringify(remindersRaw)),
        ...JSON.parse(JSON.stringify(holidaysRaw)),
      ],
    };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
