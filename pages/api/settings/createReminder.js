import Reminder from '../../../models/Reminder';

export default async function addReminder(req, res) {
  try {
    const result = await Reminder.create(req.body);
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
