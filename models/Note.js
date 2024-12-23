import { Schema, model, models } from 'mongoose';

const NoteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  pinned: {
    type: Boolean,
    required: true,
    default: false,
  },
  pinnedDate: {
    type: Date,
    required: true,
  },
  confirmDeletion: {
    type: Boolean,
    required: true,
    default: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const Note = models.Note ?? model('Note', NoteSchema);

export default Note;
