import { Schema, model, models } from 'mongoose';

const BirthdaySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Birthday = models.Birthday ?? model('Birthday', BirthdaySchema);

export default Birthday;
