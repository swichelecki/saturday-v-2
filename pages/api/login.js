import User from '../../models/User';
import { setCookie } from 'cookies-next';
import { SignJWT } from 'jose';
const jwtSecret = process.env.JWT_SECRET;

export default async function login(req, res) {
  try {
    const { username, password } = req.body;
    const result = await User.findOne({ username, password });
    if (!result) {
      return res.status(403).end();
    } else {
      const token = await new SignJWT({ hasToken: true })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(new TextEncoder().encode(jwtSecret));
      setCookie('saturday', token, { req, res });
      return res.status(200).end();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
