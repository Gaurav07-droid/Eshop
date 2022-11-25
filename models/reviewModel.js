const mongoose = require('mongoose');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: [1, 'Ratings must be greater than 1'],
    max: [5, 'Ratings must be less than or can be 5'],
    default: 3.5,
  },

  review: {
    type: String,
    maxLength: [60, 'Review must be less than 60 characters'],
  },

  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'A review must be on product'],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A review must belong to a user'],
  },
});

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'product',
    select: 'name image price',
  }).populate({
    path: 'user',
    select: 'name profileImage',
  });

  next();
});

reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating.toFixed(1),
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 3.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  //same as clling the function with model Review
  this.constructor.calcAverageRating(this.product._id);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
