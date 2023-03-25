import connectDB from '../../config/db';
import Task from '../../models/Task';

export default async function updateBirthdays(req, res) {
  await connectDB();

  try {
    const { _id, name, date } = req.body;

    await Task.updateOne(
      { _id: _id },
      {
        name,
        date,
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
