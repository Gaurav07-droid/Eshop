const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    reviewController.settingDefaultIds,
    reviewController.createReview
  )
  .get(authController.protect, reviewController.getAllReviews);

router
  .route('/:id')
  .get(reviewController.getAReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
