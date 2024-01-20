import connectDB from '../../../config/db';
import User from '../../../models/User';
import { setCookie } from 'cookies-next';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
const jwtSecret = process.env.JWT_SECRET;

export default async function login(req, res) {
  try {
    await connectDB();

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && bcrypt.compare(password === user.password)) {
      const token = await new SignJWT({ hasToken: true, id: user._id })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(new TextEncoder().encode(jwtSecret));
      setCookie('saturday', token, { req, res });

      res.status(200).end();
    } else {
      res.status(403).end();
      throw new Error('Incorrect User Credentials');
    }
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}
