import { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  column: {
    type: Number,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  confirmDeletion: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
  },
  dateAndTime: {
    type: Date,
  },
  mandatoryDate: {
    type: Boolean,
    required: true,
  },
});

const Task = models.Task ?? model('Task', TaskSchema);

export default Task;
