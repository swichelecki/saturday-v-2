import { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema({
  priority: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
  },
  dateAndTime: {
    type: Date,
  },
});

const Task = models.Task ?? model('Task', TaskSchema);

export default Task;
