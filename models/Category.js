import { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  priority: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  mandatoryDate: {
    type: Boolean,
    required: true,
  },
  confirmDeletion: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const Category = models.Category ?? model('Category', CategorySchema);

export default Category;
