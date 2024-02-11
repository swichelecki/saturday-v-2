import Category from '../../../models/Category';
import Task from '../../../models/Task';

export default async function deleteCategory(req, res) {
  try {
    const { userId, _id } = req.body;
    const category = await Category.findOne({ _id });
    const { type } = category;
    await Task.deleteMany({ type, userId });
    await Category.deleteOne({ _id: _id });

    return res.status(200).end();
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
