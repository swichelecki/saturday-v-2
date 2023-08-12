import connectDB from '../../config/db';
import Task from '../../models/Task';

export default async function updateTask(req, res) {
  await connectDB();

  try {
    const {
      _id,
      priority,
      title,
      description,
      confirmDeletion,
      date,
      dateAndTime,
    } = req.body;

    await Task.updateOne(
      { _id: _id },
      {
        priority,
        title,
        description,
        confirmDeletion,
        date,
        dateAndTime,
      }
    );

    const result = await Task.find({ _id: _id });
    return res.status(200).send(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
