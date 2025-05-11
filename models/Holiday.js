import { Schema, model, models } from 'mongoose';

const HolidaySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Holiday = models.Holiday ?? model('Holiday', HolidaySchema);

export default Holiday;
