import Category from '../../../models/Category';
import Task from '../../../models/Task';

export default async function updateCategory(req, res) {
  try {
    const { _id, userId, priority, type, mandatoryDate } = req.body;
    const newItemColumn = priority;

    await Category.updateOne(
      { _id: _id },
      {
        userId,
        priority,
        type,
        mandatoryDate,
      }
    );

    const itemsOfCategoryType = await Task.find({ type, userId });

    itemsOfCategoryType.forEach(async (item) => {
      const {
        _id,
        priority,
        title,
        description,
        confirmDeletion,
        date,
        dateAndTime,
      } = item;

      await Task.updateOne(
        { _id: _id },
        {
          priority,
          column: newItemColumn,
          title,
          description,
          confirmDeletion,
          date,
          dateAndTime,
        }
      );
    });

    return res.status(200).end();
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
