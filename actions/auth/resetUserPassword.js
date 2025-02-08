'use server';

import connectDB from '../../config/db';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { handleServerErrorMessage } from '../../utilities';
import { resetPasswordSchema } from '../../schemas/schemas';

export default async function resetUserPassword(formData) {
  if (!(formData instanceof Object)) {
    return {
      status: 400,
      error: 'Bad Request',
    };
  }

  // check that data shape is correct
  const zodValidationResults = resetPasswordSchema.safeParse(formData);

  const {
    data: zodData,
    success,
    error: zodValidationError,
  } = zodValidationResults;
  if (!success) {
    console.error(zodValidationError);
    return {
      status: 400,
      error: 'Zod validation failed. Check server console.',
    };
  }

  try {
    await connectDB();

    const { email, password, userId: hashedUserId } = zodData;

    const user = await User.findOne({ email });
    const userIdObj = user._id;
    const userIdString = userIdObj.toString();

    if (!user) return { status: 404 };

    // check that 5 minutes has not passed since password reset requested
    const updatedAtDateObj = new Date(user.updatedAt);
    const updatedAtMsec = updatedAtDateObj.getTime();
    const date = new Date();
    const currentTimeMsc = date.getTime();
    const fiveMinutesMsc = 300000;
    if (currentTimeMsc > updatedAtMsec + fiveMinutesMsc)
      return { status: 410, error: 'Password reset request expired.' };

    // update new password
    if (await bcrypt.compare(userIdString, hashedUserId)) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.updateOne(
        { _id: user._id },
        {
          password: hashedPassword,
        }
      );
      return { status: 200 };
    }

    throw new Error('User ids do not match.');
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error(errorMessage);
    return { status: 500, error: errorMessage };
  }
}
