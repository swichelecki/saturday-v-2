import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function updateUserPassword(req, res) {
  try {
    const { userId, email, password, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (user && bcrypt.compare(password === user.password)) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await User.updateOne(
        { _id: userId },
        {
          password: hashedPassword,
        }
      );

      res.status(200).end();
    } else {
      res.status(400).end();
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}
