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
    },
    newUser: {
      type: Boolean,
      required: true,
    },
    newNotesUser: {
      type: Boolean,
      required: true,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    customerId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const User = models.User ?? model('User', UserSchema);

export default User;
