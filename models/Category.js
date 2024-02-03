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
  type: {
    type: String,
    required: true,
  },
  mandatoryDate: {
    type: Boolean,
    required: true,
  },
});

const Category = models.Category ?? model('Category', CategorySchema);

export default Category;
