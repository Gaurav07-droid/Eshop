const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    cartController.settigDefaultIds,
    cartController.addToCart
  )
  .get(cartController.getAllCartProducts);

router
  .route('/:id')
  .get(cartController.getACartProduct)
  .delete(cartController.removeCartProduct);

module.exports = router;
