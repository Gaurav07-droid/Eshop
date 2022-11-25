const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');
const Product = require('../models/productModel');
const bookingController = require('../controllers/bookingController');
const express = require('express');

const router = express.Router();

router.get('/api/v1/user/login', viewsController.getLogin);
router.get('/api/v1/user/signup', viewsController.getSignup);
router.get('/api/v1/forgot-password', viewsController.getForgotPass);
router.get('/api/v1/reset-password', viewsController.getResetPass);

router.use(authController.isLoggedIn);

router.get('/api/v1/categories', viewsController.getOverview);

router.get('/api/v1/:name/products', viewsController.getCategoryProducts);
router.get('/api/v1/:category/product/:id', viewsController.getProduct);

router.get('/api/v1/my-account', viewsController.getAccount);
router.get('/api/v1/change-password', viewsController.passwordChange);
router.get('/api/v1/my-cart', viewsController.getMyCart);
router.get(
  '/api/v1/my-orders',
  bookingController.createOrderCheckout,
  viewsController.getOrders
);
router.get('/api/v1/products/:id/review', viewsController.getReviewForm);

module.exports = router;
