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
      // TODO: build secure login
      // example https://dev.to/mgranados/how-to-build-a-simple-login-with-nextjs-and-react-hooks-255
      setCookie('saturday', 'youareme', { req, res });
      return res.status(200).send();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
