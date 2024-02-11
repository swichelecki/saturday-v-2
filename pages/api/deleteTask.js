import Task from '../../models/Task';

export default async function deleteTask(req, res) {
  try {
    await Task.deleteOne({ _id: req.body });
    return res.status(200).end();
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
