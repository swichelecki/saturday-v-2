import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    admin: {
      type: Boolean,
      required: true,
      default: false,
    },
    newUser: {
      type: Boolean,
      required: true,
      default: true,
    },
    newNotesUser: {
      type: Boolean,
      required: true,
      default: true,
    },
    isSubscribed: {
      type: Boolean,
      required: true,
      default: false,
    },
    customerId: {
      type: String,
    },
    twoFactorAuthCode: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = models.User ?? model('User', UserSchema);

export default User;
