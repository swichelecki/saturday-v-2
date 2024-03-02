import Reminder from '../../../models/Reminder';

export default async function updateReminder(req, res) {
  try {
    const {
      _id,
      userId,
      reminder,
      reminderDate,
      recurrenceInterval,
      recurrenceBuffer,
      exactRecurringDate,
      displayReminder,
    } = req.body;

    await Reminder.updateOne(
      { _id: _id },
      {
        userId,
        reminder,
        reminderDate,
        recurrenceInterval,
        recurrenceBuffer,
        exactRecurringDate,
        displayReminder,
      }
    );

    const result = await Reminder.find({ _id: _id });
    return res.status(200).send(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
