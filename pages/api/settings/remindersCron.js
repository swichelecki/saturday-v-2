import Reminder from '../../../models/Reminder';

export default async function remindersCron(req, res) {
  try {
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
        if (nextOccurrance <= Date.now() && item?.displayReminder === false) {
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
      }
    }

    // display reminders with exact recurring date
    if (exactRecurringDateReminders?.length > 0) {
      for (const item of exactRecurringDateReminders) {
        const todayMilliseconds = new Date().getTime();
        const nextOccurrance = new Date(item?.reminderDate).getTime();
        const reminderDateObject = new Date(item?.reminderDate);
        const reminderDateMinusBuffer = reminderDateObject.setDate(
          reminderDateObject.getDate() - item?.recurrenceBuffer
        );

        // display
        if (
          nextOccurrance > Date.now() &&
          reminderDateMinusBuffer <= todayMilliseconds &&
          item?.displayReminder === false
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
        if (nextOccurrance <= Date.now() && item?.displayReminder) {
          const today = new Date();
          const interval = item?.recurrenceInterval;
          const date = new Date(item?.reminderDate);
          date.setMonth(today.getMonth() + interval);
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

    return res.status(200).end();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
