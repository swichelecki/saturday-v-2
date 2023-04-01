import connectDB from '../../config/db';
import User from '../../models/User';
import { setCookie } from 'cookies-next';

export default async function login(req, res) {
  await connectDB();

  try {
    const result = await User.findOne(req.body);
    if (!result) {
      return res.status(403).send();
    } else {
      setCookie('saturday', 'youareme', { req, res, maxAge: 60 * 60 * 24 });
      return res.status(200).send();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
