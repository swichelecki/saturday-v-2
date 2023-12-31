import Birthday from '../../models/Birthday';

export default async function updateBirthdays(req, res) {
  try {
    const { _id, name, date } = req.body;

    await Birthday.updateOne(
      { _id: _id },
      {
        name,
        date,
      }
    );

    return res.status(200).end();
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
