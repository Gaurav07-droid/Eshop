const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/Email');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You donot have permission to perform this action!', 403)
      );
    }

    next();
  };
};

const signToken = function (user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendSignedToken = function (req, user, statusCode, res) {
  const token = signToken(user);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_Cookie_ExpiresIn * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers('x-forwarded-proto') === 'https',
  };
  // if (req.secure || req.headers('x-forwarded-proto') === 'https')
  //   cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // if (process.env.NODE_ENV === 'production') {
  //   cookieRes.secure = true;
  // }

  res.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    profileImage: req.body.profileImage,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    changedPasswordAt: req.body.changedPasswordAt,
  });

  const url = `${req.protocol}://${req.get('host')}/api/v1/users/me`;

  await new Email(user, url).sendWelcome();

  sendSignedToken(req, user, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password!', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user)
    return next(new AppError('No user found with that email!Try again', 401));

  const validPass = await user.comparePassword(user.password, password);

  if (!validPass)
    return next(new AppError('Incorrect email or password!Try again', 401));

  sendSignedToken(req, user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(new AppError('Please log in to access this route!', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('User belonging to this token no longer exists!', 401)
    );
  }

  //check user change password after the token issued
  if (currentUser.checkPasswordChange(decoded.iat))
    return next(
      new AppError(
        'User recently changed the password! Please login again',
        401
      )
    );

  req.user = currentUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    //check user change password after the token issued
    if (currentUser.checkPasswordChange(decoded.iat)) return next();

    //User in pug coming from here
    res.locals.user = currentUser;
    req.user = currentUser;
    return next();
  }
  next();
});

exports.changeMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  const validPass = await user.comparePassword(user.password, currentPassword);
  if (!validPass)
    return next(
      'Incorrect current password! Please provide correct password and try again.',
      403
    );

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({ validateBeforeSave: true });

  sendSignedToken(req, user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError(
        'No user found with that email! Please provide an valid email Id.',
        404
      )
    );

  const resetToken = user.createPasswordSendToken();
  await user.save({ validateBeforeSave: false });

  // const resetUrl = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/users/resetPassword`;

  // const message = `Forgot Your Password ? Submit a request with this token ${resetToken} to reset password.\n If you didn't forget your password please ignore this email.`;

  try {
    await new Email(user, resetToken).sendPassToken();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to the mail!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error  while sending the token ! Please try again.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError('Invalid token or has been expired!', 400));

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save({ validateBeforeSave: true });

  sendSignedToken(req, user, 200, res);
});

exports.logOut = (req, res, next) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};
