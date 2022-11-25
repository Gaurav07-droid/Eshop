const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An category must have a name'],
  },

  minPrice: Number,

  imageCover: {
    type: String,
    required: [true, 'An category requires a image cover'],
  },

  products: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Product',
  },
});

categorySchema.index({ name: 1 }, { unique: true });

categorySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'products',
  });

  next();
});

const catModel = mongoose.model('Category', categorySchema);

module.exports = catModel;
