import connectDB from '../../config/db';
import Birthday from '../../models/Birthday';

export default async function updateBirthdays(req, res) {
  await connectDB();

  try {
    const { _id, name, date } = req.body;

    await Birthday.updateOne(
      { _id: _id },
      {
        name,
        date,
      }
    );
  } catch (error) {
    console.log(error);
  }
}
