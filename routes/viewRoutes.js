const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');
const Product = require('../models/productModel');
const bookingController = require('../controllers/bookingController');
const express = require('express');

const router = express.Router();

router.get('/user/login', viewsController.getLogin);
router.get('/user/signup', viewsController.getSignup);
router.get('/forgot-password', viewsController.getForgotPass);
router.get('/reset-password', viewsController.getResetPass);

router.use(authController.isLoggedIn);

router.get('/categories', viewsController.getOverview);

router.get('/:name/products', viewsController.getCategoryProducts);
router.get('/:category/product/:id', viewsController.getProduct);

router.get('/my-account', viewsController.getAccount);
router.get('/change-password', viewsController.passwordChange);
router.get('/my-cart', viewsController.getMyCart);
router.get(
  '/my-orders',
  bookingController.createOrderCheckout,
  viewsController.getOrders
);
router.get('/products/:id/review', viewsController.getReviewForm);

module.exports = router;
