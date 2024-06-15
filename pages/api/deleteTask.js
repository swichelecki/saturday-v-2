import Task from '../../models/Task';

export default async function deleteTask(req, res) {
  try {
    const item = await Task.find({ _id: req.body });
    await Task.deleteOne({ _id: req.body });
    return res.status(200).send(item[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
