const express = require('express');

const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:productid/reviews', reviewRouter);

router
  .route('/top-products')
  .get(productController.aliasingProducts, productController.getAllProducts);

router
  .route('/products-stats')
  .get(authController.restrictTo('admin'), productController.getProductStats);

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'seller'),
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.createProduct
  )
  .get(productController.getAllProducts);

router
  .route('/:id')
  .get(productController.getAProduct)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'seller'),
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'seller'),
    productController.deleteProduct
  );

module.exports = router;
