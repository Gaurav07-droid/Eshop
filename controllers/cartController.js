const Cart = require('../models/cartModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.settigDefaultIds = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.id;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.addToCart = catchAsync(async (req, res) => {
  const cart = await Cart.create({
    product: req.body.product,
    user: req.body.user,
  });

  res.status(200).json({
    status: 'success',
    data: cart,
  });
});

exports.getAllCartProducts = catchAsync(async (req, res, next) => {
  let cart;

  if (req.originalUrl.includes('my-cart')) {
    cart = await Cart.find({ user: req.user.id });
  } else {
    cart = await Cart.find();
  }

  if (cart.length == 0)
    return next(new AppError('Sorry no products found in the cart!', 404));

  res.status(200).json({
    status: 'success',
    results: cart.length,
    data: cart,
  });
});

exports.getACartProduct = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.id);

  if (!cart)
    return next(new AppError('Sorry no products found with that id!', 404));

  res.status(200).json({
    status: 'success',
    data: cart,
  });
});

exports.removeCartProduct = catchAsync(async (req, res) => {
  const cart = await Cart.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
  });
});
