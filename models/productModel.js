const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name.'],
      minLength: [2, 'A product name must be greater than 2 characters.'],
      maxLength: [65, 'A product name must be less than 65 characters.'],
    },

    images: {
      type: [String],
      default: 'default-product.jpg',
      required: [true, 'A product must have an image.'],
    },

    price: {
      type: Number,
      required: [true, 'A product must have price.'],
    },

    description: {
      type: String,
      maxLength: [200, 'Description can not exceed more than 120 characters.'],
    },

    categeory: {
      type: String,
      required: [true, 'A product must belong to a categeory.'],
    },

    highlights: {
      type: [String],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    ratingsAverage: {
      type: Number,
      min: [1, 'Ratings must be greater than 1'],
      max: [5, 'Ratings must be less than or equal to 5'],
      default: 3.5,
    },

    size: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('discount').get(function () {
  return (this.price * 10) / 100;
});

//virtual populate
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.index({ price: 1, ratingsAverage: -1, categeory: 1 });

//document middleware
// productSchema.pre('save', function () {
//   console.log(this);
// });

//query middleware
productSchema.pre(/^find/, function (next) {
  this.start = Date.now();
  next();
});

productSchema.post(/^find/, function () {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
});

productSchema.pre('aggregate', function (next) {
  console.log(
    this.pipeline().unshift({ $match: { categeory: { $ne: 'footwear' } } })
  );
  console.log(this.pipeline());

  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
