import connectDB from '../../config/db';
import Task from '../../models/Task';

export default async function deleteTask(req, res) {
  await connectDB();

  try {
    const result = await Task.deleteOne({ _id: req.body });

    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
