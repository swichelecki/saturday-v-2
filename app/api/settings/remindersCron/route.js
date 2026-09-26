import connectDB from '../../../../config/db';
import Reminder from '../../../../models/Reminder';
import Holiday from '../../../../models/Holiday';
import { TWENTYFOUR_HOURS } from '../../../../constants';

export async function GET() {
  await connectDB();
  const reminders = await Reminder.find();

  const generalReminders = [];
  const exactRecurringDateReminders = [];

  // sort reminders by type
  for (const item of reminders) {
    item?.exactRecurringDate
      ? exactRecurringDateReminders.push(item)
      : generalReminders.push(item);
  }

  // handle manually reset reminders
  for (const item of generalReminders) {
    const reminderStartingDate = new Date(item?.reminderDate);
    const reminderDate = reminderStartingDate.getTime();
    const interval = item?.recurrenceInterval;

    // display general reminders
    if (reminderDate <= Date.now() && !item?.displayReminder) {
      try {
        await Reminder.updateOne(
          { _id: item._id },
          {
            displayReminder: true,
          },
        );
      } catch (e) {
        console.error('Error displaying general reminder: ', e);
      }
    }

    // add interval to by-week reminders not reset before next interval start date begins
    if (
      Math.abs(interval).toString().length > 2 &&
      reminderDate + interval <= Date.now() &&
      item?.displayReminder
    ) {
      try {
        reminderStartingDate.setTime(reminderStartingDate.getTime() + interval);
        const nextDate = reminderStartingDate.toISOString().split('T')[0];

        await Reminder.updateOne(
          { _id: item._id },
          {
            reminderDate: nextDate,
            reminderSortDate: nextDate,
          },
        );
      } catch (e) {
        console.error('Error updating by-week reminder not reset: ', e);
      }
    }

    // add interval to by-month reminders not reset before next interval start date begins
    if (
      !Math.abs(interval).toString().length > 2 &&
      reminderStartingDate.setUTCMonth(
        reminderStartingDate.getUTCMonth() + interval,
      ) <= Date.now() &&
      item?.displayReminder
    ) {
      try {
        const interval = item?.recurrenceInterval;
        const date = new Date(item?.reminderDate);

        const reminderDay = date.getUTCDate();
        const reminderMonth = date.getUTCMonth();
        const reminderYear = date.getUTCFullYear();

        // get last day of the current reminder's month
        const lastDayOfReminderMonth = new Date(
          Date.UTC(reminderYear, reminderMonth + 1, 0),
        ).getUTCDate();

        const lastDayOfMonth = reminderDay === lastDayOfReminderMonth;

        // get last day of the next scheduled month
        const lastDayOfNextMonth = new Date(
          Date.UTC(reminderYear, reminderMonth + interval + 1, 0),
        ).getUTCDate();

        // next interval calendar number is within current calendar number range and not last day
        if (reminderDay <= lastDayOfNextMonth && !lastDayOfMonth) {
          date.setUTCMonth(date.getUTCMonth() + interval);
        } else {
          // set last day of next interval month - current calendar number not in range of next or current calendar number last day of month
          date.setTime(
            new Date(
              Date.UTC(reminderYear, reminderMonth + interval + 1, 0),
            ).getTime(),
          );
        }

        const nextDate = date.toISOString().split('T')[0];

        await Reminder.updateOne(
          { _id: item._id },
          {
            reminderDate: nextDate,
            reminderSortDate: nextDate,
          },
        );
      } catch (e) {
        console.error('Error updating by-month reminder not reset: ', e);
      }
    }
  }

  // handle automatically reset reminders
  for (const item of exactRecurringDateReminders) {
    const today = new Date().getTime();
    const reminderDate = new Date(item?.reminderDate).getTime();
    const reminderDateObject = new Date(item?.reminderDate);
    const reminderDateMinusBuffer = reminderDateObject.setDate(
      reminderDateObject.getDate() - item?.recurrenceBuffer,
    );
    const interval = item?.recurrenceInterval;

    // display reminders with automatic reset
    if (
      reminderDate > Date.now() &&
      reminderDateMinusBuffer <= today &&
      !item?.displayReminder
    ) {
      try {
        await Reminder.updateOne(
          { _id: item._id },
          {
            displayReminder: true,
          },
        );
      } catch (e) {
        console.error('Error displaying reminder with exact recurring date', e);
      }
    }

    // reschedule automatically reset reminders - recurrence in 1 to 4 weeks
    if (
      Math.abs(interval).toString().length > 2 &&
      reminderDate + TWENTYFOUR_HOURS < Date.now() &&
      item?.displayReminder
    ) {
      try {
        const reminderStartingDate = new Date(item?.reminderDate);
        reminderStartingDate.setTime(reminderStartingDate.getTime() + interval);
        const nextDate = reminderStartingDate.toISOString().split('T')[0];

        // get new sort date - date minus recurrenceBuffer
        const sortDate = new Date(nextDate);
        sortDate.setUTCDate(sortDate.getUTCDate() - item.recurrenceBuffer);
        const newReminderSortDate = sortDate.toISOString().split('T')[0];

        await Reminder.updateOne(
          { _id: item._id },
          {
            reminderDate: nextDate,
            reminderSortDate: newReminderSortDate,
            displayReminder: sortDate <= today ? true : false,
          },
        );
      } catch (e) {
        console.error(
          'Error rescheduling reminder with exact recurring date - recurrence in 1 to 4 weeks: ',
          e,
        );
      }
    }

    // reschedule automatically reset reminders - recurrance in months / annual
    if (
      !Math.abs(interval).toString().length > 2 &&
      reminderDate + TWENTYFOUR_HOURS < Date.now() &&
      item?.displayReminder
    ) {
      try {
        const interval = item?.recurrenceInterval;
        const date = new Date(item?.reminderDate);

        const reminderDay = date.getUTCDate();
        const reminderMonth = date.getUTCMonth();
        const reminderYear = date.getUTCFullYear();

        // get last day of the current reminder's month
        const lastDayOfReminderMonth = new Date(
          Date.UTC(reminderYear, reminderMonth + 1, 0),
        ).getUTCDate();

        const lastDayOfMonth = reminderDay === lastDayOfReminderMonth;

        // get last day of the next scheduled month
        const lastDayOfNextMonth = new Date(
          Date.UTC(reminderYear, reminderMonth + interval + 1, 0),
        ).getUTCDate();

        // next interval calendar number is within current calendar number range and not last day
        if (reminderDay <= lastDayOfNextMonth && !lastDayOfMonth) {
          date.setUTCMonth(date.getUTCMonth() + interval);
        } else {
          // set last day of next interval month - current calendar number not in range of next or current calendar number last day of month
          date.setTime(
            new Date(
              Date.UTC(reminderYear, reminderMonth + interval + 1, 0),
            ).getTime(),
          );
        }

        const nextDate = date.toISOString().split('T')[0];

        // get new sort date - date minus recurrenceBuffer
        const sortDate = new Date(date);
        sortDate.setUTCDate(sortDate.getUTCDate() - item.recurrenceBuffer);
        const newReminderSortDate = sortDate.toISOString().split('T')[0];

        await Reminder.updateOne(
          { _id: item._id },
          {
            reminderDate: nextDate,
            reminderSortDate: newReminderSortDate,
            displayReminder: false,
          },
        );
      } catch (e) {
        console.error(
          'Error rescheduling reminder with exact recurring date - recurrance in months / annual: ',
          e,
        );
      }
    }
  }

  // handle fetching US holidays on January 1 of each year
  const today = Date.now();
  const yesterday = today - TWENTYFOUR_HOURS;
  const yearToday = new Date(today).getUTCFullYear();
  const yearYesterday = new Date(yesterday).getUTCFullYear();
  if (yearToday > yearYesterday) {
    try {
      await Holiday.deleteMany();
      const response = await fetch(
        `https://date.nager.at/api/v3/publicholidays/${yearToday}/US`,
      );
      const holidays = await response.json();

      for (const holiday of holidays) {
        await Holiday.create({ title: holiday?.name, date: holiday?.date });
      }
    } catch (e) {
      console.error('Error fetching US holidays: ', e);
    }
  }

  return new Response(JSON.stringify({ status: 200 }));
}
