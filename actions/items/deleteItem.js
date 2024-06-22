'use server';

import Task from '../../models/Task';

export default async function deleteTask(_id) {
  try {
    const result = await Task.find({ _id: _id });
    await Task.deleteOne({ _id: _id });
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
}
