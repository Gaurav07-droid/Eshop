const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const cartRoutes = require('../routes/cartRoutes');

const router = express.Router({ mergeParams: true });

router.post('/login', authController.login);
router.get('/logout', authController.logOut);
router.post('/signup', authController.signUp);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.use('/my-cart', cartRoutes);

router.patch('/updateMe', userController.uploadImage, userController.updateMe);
router.get('/getMe', userController.getMe);
router.delete('/deleteMe', userController.deleteMe);
router.patch('/updateMyPassword', authController.changeMyPassword);

router.get('/', authController.restrictTo('admin'), userController.getAllUsers);

router
  .route('/:id')
  .get(authController.restrictTo('admin'), userController.getAUser)
  .patch(authController.restrictTo('admin'), userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
