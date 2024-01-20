import User from '../../../models/User';
import Task from '../../../models/Task';
import bcrypt from 'bcryptjs';

export default async function deleteAccount(req, res) {
  try {
    const { userId, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && bcrypt.compare(password === user.password)) {
      await Task.deleteMany({ userId });
      await User.deleteOne({ _id: userId });
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
