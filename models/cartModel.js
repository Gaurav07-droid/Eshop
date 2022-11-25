const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Product must be placed in cart.'],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Cart must belong to a user  '],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

cartSchema.index({ product: 1, user: 1 }, { unique: true });

cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'product',
  }).populate({
    path: 'user',
    select: 'name email',
  });

  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
