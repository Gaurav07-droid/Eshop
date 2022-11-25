const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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

  price: { type: Number, required: [true, 'Product must have price'] },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

orderSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'product' });

  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
