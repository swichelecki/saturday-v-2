import Task from '../../models/Task';

export default async function addTask(req, res) {
  try {
    const result = await Task.create(req.body);
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
