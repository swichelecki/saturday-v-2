import connectDB from '../../config/db';
import Task from '../../models/Task';

export default async function getTask(req, res) {
  await connectDB();

  try {
    const result = await Task.find({ _id: req.body });

    return res.status(200).send(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
