const express = require('express');

const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    categoryController.uploadCategoryImage,
    categoryController.resizeImage,
    categoryController.defaultProducts,
    categoryController.createCategory
  )
  .get(categoryController.getAllCategory);

router
  .route('/:id')
  .get(categoryController.getACategory)
  .patch(authController.protect, categoryController.updateCategory)
  .delete(authController.protect, categoryController.deleteCategory);

module.exports = router;
