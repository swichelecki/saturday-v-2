import connectDB from '../../../../config/db';
import Reminder from '../../../../models/Reminder';
import Holiday from '../../../../models/Holiday';
import { BY_WEEK_INTERVALS, TWENTYFOUR_HOURS } from '../../../../constants';

export async function GET() {
  try {
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

    // handle general reminders
    if (generalReminders?.length > 0) {
      for (const item of generalReminders) {
        const reminderStartingDate = new Date(item?.reminderDate);
        const nextOccurrance = reminderStartingDate.getTime();
        const interval = item?.recurrenceInterval;

        const {
          _id,
          userId,
          reminder,
          reminderDate,
          recurrenceInterval,
          recurrenceBuffer,
          exactRecurringDate,
          displayReminder,
        } = item;

        // dispaly general reminders
        if (nextOccurrance <= Date.now() && !item?.displayReminder) {
          await Reminder.updateOne(
            { _id: _id },
            {
              userId,
              reminder,
              reminderDate,
              recurrenceInterval,
              recurrenceBuffer,
              exactRecurringDate,
              displayReminder: true,
            }
          );
        }

        // add interval to by-week reminders not reset before next interval start date begins
        if (
          BY_WEEK_INTERVALS.includes(interval) &&
          nextOccurrance + interval <= Date.now() &&
          item?.displayReminder
        ) {
          reminderStartingDate.setTime(
            reminderStartingDate.getTime() + interval
          );
          const nextDate = reminderStartingDate.toISOString();

          await Reminder.updateOne(
            { _id: _id },
            {
              userId,
              reminder,
              reminderDate: nextDate,
              recurrenceInterval,
              recurrenceBuffer,
              exactRecurringDate,
              displayReminder,
            }
          );
        }

        // add interval to by-month reminders not reset before next interval start date begins
        if (
          !BY_WEEK_INTERVALS.includes(interval) &&
          reminderStartingDate.setMonth(
            reminderStartingDate.getMonth() + interval
          ) <= Date.now() &&
          item?.displayReminder
        ) {
          const nextDate = reminderStartingDate.toISOString();

          await Reminder.updateOne(
            { _id: _id },
            {
              userId,
              reminder,
              reminderDate: nextDate,
              recurrenceInterval,
              recurrenceBuffer,
              exactRecurringDate,
              displayReminder,
            }
          );
        }
      }
    }

    // handle reminders with exact recurring date
    if (exactRecurringDateReminders?.length > 0) {
      for (const item of exactRecurringDateReminders) {
        const today = new Date().getTime();
        const nextOccurrance = new Date(item?.reminderDate).getTime();
        const reminderDateObject = new Date(item?.reminderDate);
        const reminderDateMinusBuffer = reminderDateObject.setDate(
          reminderDateObject.getDate() - item?.recurrenceBuffer
        );

        // display reminders with exact recurring date
        if (
          nextOccurrance > Date.now() &&
          reminderDateMinusBuffer <= today &&
          !item?.displayReminder
        ) {
          const {
            _id,
            userId,
            reminder,
            reminderDate,
            recurrenceInterval,
            recurrenceBuffer,
            exactRecurringDate,
          } = item;

          await Reminder.updateOne(
            { _id: _id },
            {
              userId,
              reminder,
              reminderDate,
              recurrenceInterval,
              recurrenceBuffer,
              exactRecurringDate,
              displayReminder: true,
            }
          );
        }

        // reschedule reminders with exact recurring date
        if (
          nextOccurrance + TWENTYFOUR_HOURS < Date.now() &&
          item?.displayReminder
        ) {
          const interval = item?.recurrenceInterval;
          const date = new Date(item?.reminderDate);
          date.setMonth(date.getMonth() + interval);
          const nextDate = date.toISOString();

          const {
            _id,
            userId,
            reminder,
            recurrenceInterval,
            recurrenceBuffer,
            exactRecurringDate,
          } = item;

          await Reminder.updateOne(
            { _id: _id },
            {
              userId,
              reminder,
              reminderDate: nextDate,
              recurrenceInterval,
              recurrenceBuffer,
              exactRecurringDate,
              displayReminder: false,
            }
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
      await Holiday.deleteMany();
      const response = await fetch(
        `https://date.nager.at/api/v3/publicholidays/${yearToday}/US`
      );
      const holidays = await response.json();

      for (const holiday of holidays) {
        await Holiday.create({ title: holiday?.name, date: holiday?.date });
      }
    }

    return new Response(JSON.stringify({ status: 200 }));
  } catch (error) {
    console.log(error);
    throw new Error('Error running remindersCron');
  }
}
