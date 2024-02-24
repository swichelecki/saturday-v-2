import Reminder from '../../../models/Reminder';

export default async function deleteReminder(req, res) {
  try {
    await Reminder.deleteOne({ _id: req.body });
    return res.status(200).end();
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
