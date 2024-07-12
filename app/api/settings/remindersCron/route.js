import connectDB from '../../../../config/db';
import Reminder from '../../../../models/Reminder';
import { handleDateNow } from '../../../../utilities';

export async function GET(req) {
  try {
    await connectDB();
    const reminders = await Reminder.find();

    if (!reminders?.length) return;

    const generalReminders = [];
    const exactRecurringDateReminders = [];

    // sort reminders by type
    for (const item of reminders) {
      if (item?.exactRecurringDate) {
        exactRecurringDateReminders.push(item);
      } else {
        generalReminders.push(item);
      }
    }

    // display general reminders
    if (generalReminders?.length > 0) {
      for (const item of generalReminders) {
        const nextOccurrance = new Date(item?.reminderDate).getTime();
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

        // show next occurance of reminder
        if (nextOccurrance <= handleDateNow() && !item?.displayReminder) {
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

        // add interval to reminder not reset before next interval start date begins
        if (
          nextOccurrance + interval <= handleDateNow() &&
          item?.displayReminder
        ) {
          const reminderStartingDate = new Date(item?.reminderDate);
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
      }
    }

    // display reminders with exact recurring date
    if (exactRecurringDateReminders?.length > 0) {
      for (const item of exactRecurringDateReminders) {
        const today = new Date().getTime();
        const nextOccurrance = new Date(item?.reminderDate).getTime();
        const reminderDateObject = new Date(item?.reminderDate);
        const reminderDateMinusBuffer = reminderDateObject.setDate(
          reminderDateObject.getDate() - item?.recurrenceBuffer
        );

        // display
        if (
          nextOccurrance > handleDateNow() &&
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

        // reschedule
        if (nextOccurrance <= handleDateNow() && item?.displayReminder) {
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

    return new Response(JSON.stringify({ status: 200 }));
  } catch (error) {
    console.log(error);
    throw new Error('Error running remindersCron');
  }
}
