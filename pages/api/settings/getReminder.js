import Reminder from '../../../models/Reminder';

export default async function getReminder(req, res) {
  try {
    const result = await Reminder.find({ _id: req.body });

    return res.status(200).send(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
