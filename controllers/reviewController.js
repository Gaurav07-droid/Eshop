const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.settingDefaultIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.product) req.body.product = req.params.productid;
  next();
};

exports.createReview = catchAsync(async (req, res, next) => {
  const review = await Review.create({
    rating: req.body.rating,
    review: req.body.review,
    product: req.body.product,
    user: req.body.user,
  });

  res.status(200).json({
    status: 'success',
    data: review,
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let reviews;

  if (req.params.id) {
    reviews = await Review.findOne({
      product: req.params.productid,
      user: req.user.id,
    });
  } else {
    reviews = await Review.find();
  }

  if (reviews.length == 0)
    return next(new AppError('No reviews found! please try again later', 404));

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: reviews,
  });
});

exports.getAReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (review.length == 0)
    return next(new AppError('No review found! please try again later', 404));

  res.status(200).json({
    status: 'success',
    data: review,
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const updatedReview = await Review.findByIdAndUpdate(req.params.id);

  res.status(200).json({
    status: 'success',
    data: updatedReview,
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
  });
});
