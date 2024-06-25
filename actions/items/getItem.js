'use server';

import Task from '../../models/Task';

export default async function getItem(id) {
  try {
    const result = await Task.find({ _id: id });
    return { status: 200, item: JSON.parse(JSON.stringify(result[0])) };
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
