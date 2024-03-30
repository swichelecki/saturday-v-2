import Reminder from '../../../models/Reminder';

export default async function checkReminders(req, res) {
  try {
    const reminders = await Reminder.find();

    if (!reminders?.length) return;

    //const today = new Date();
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
        if (
          item?.reminderDate <= Date.now() &&
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
      }
    }

    return res.status(200).end();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
