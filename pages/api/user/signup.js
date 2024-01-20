import connectDB from '../../../config/db';
import User from '../../../models/User';
import { setCookie } from 'cookies-next';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
const jwtSecret = process.env.JWT_SECRET;

export default async function signup(req, res) {
  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).end();
      throw new Error('Missing required user data');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).end();
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ email, password: hashedPassword });

    if (user) {
      const token = await new SignJWT({ hasToken: true, id: user._id })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(new TextEncoder().encode(jwtSecret));
      setCookie('saturday', token, { req, res });
      res.status(200).end();
    } else {
      res.status(400).end();
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
