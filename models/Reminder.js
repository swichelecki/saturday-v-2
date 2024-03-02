import { Schema, model, models } from 'mongoose';

const ReminderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reminder: {
    type: String,
    required: true,
  },
  reminderDate: {
    type: Date,
    required: true,
  },
  recurrenceInterval: {
    type: Number,
    required: true,
  },
  recurrenceBuffer: {
    type: Number,
    required: false,
  },
  exactRecurringDate: {
    type: Boolean,
    required: true,
  },
  displayReminder: {
    type: Boolean,
    required: true,
  },
});

const Reminder = models.Reminder ?? model('Reminder', ReminderSchema);

export default Reminder;
