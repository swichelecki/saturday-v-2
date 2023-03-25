import connectDB from '../../config/db';
import Birthday from '../../models/Birthday';

export default async function getBirthdays(req, res) {
  await connectDB();

  try {
    const result = await Birthday.find().sort({ date: 1 });

    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
