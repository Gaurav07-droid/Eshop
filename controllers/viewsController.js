const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getLogin = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login to your account',
  });
};

exports.getSignup = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Create your account',
  });
};

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'my account',
  });
};

exports.getOverview = catchAsync(async (req, res, next) => {
  const categories = await Category.find();

  if (!categories)
    return next(new AppError('Sorry no categories found with that name!', 404));

  res.status(200).render('overview', {
    title: 'online shopping',
    categories,
  });
});

exports.getCategoryProducts = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ name: req.params.name });

  // category.products.forEach((el) => {
  //   const names = el.name.length > 30 ? el.name.slice(1, 30) : el.name;
  //   console.log(names);
  // });
  if (!category)
    return next(new AppError('Sorry no category found with that name !', 404));

  if (category.products.length == 0) {
    res.status(200).render('empty', {
      title: 'Coming soon',
    });
  } else {
    res.status(200).render('allproduct', {
      title: `${category.name}`.toUpperCase(),
      category,
    });
  }
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  const reviews = await Review.find({ product: req.params.id });

  if (!product)
    return next(new AppError('Sorry no product found with that name!', 404));

  res.status(200).render('product', {
    title: `${product.name}`,
    product,
    reviews,
  });
});

exports.getMyCart = catchAsync(async (req, res, next) => {
  const products = await Cart.find({
    user: req.user.id,
  }).sort({ createdAt: -1 });

  if (products.length == 0) {
    res.status(200).render('empty', {
      title: `My Cart`,
      msg: 'There is nothing in your cart!',
    });
  } else {
    res.status(200).render('cart', {
      title: `My Cart`,
      products,
    });
  }
});

exports.getResetPass = (req, res, next) => {
  res.status(200).render('resetPass', {
    title: 'Reset your password here',
  });
};
exports.passwordChange = (req, res, next) => {
  res.status(200).render('passwordChange', {
    title: 'Change your password here',
  });
};

exports.getForgotPass = (req, res, next) => {
  res.status(200).render('forgotpass', {
    title: 'Forgot password',
  });
};

exports.getOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).sort({
    createdAt: -1,
  });

  if (orders.length == 0) {
    res.status(200).render('empty', {
      title: 'Your orders',
      msg: 'No order placed yet! Shop now and avail offers',
    });
  } else {
    res.status(200).render('myOrders', {
      title: 'Your orders',
      orders,
    });
  }
});

exports.getReviewForm = (req, res, next) => {
  let proId = req.params.id;

  res.status(200).render('review', {
    title: 'Give review',
    proId,
  });
};
