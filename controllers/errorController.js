const AppError = require('../utils/appError');

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data: ${errors.join(' ')}`, 404);
};

const handleJWTError = () => {
  return new AppError('Invalid token! Please login again.', 401);
};

const handleJWTExpireError = () => {
  return new AppError('Your token has been expired! Please login again', 401);
};

const handleCastError = (err) => {
  return new AppError(`No product found with that product address.`, 404);
};

const handleDuplicateFieldsError = (err) => {
  const value = err.errmssg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}.Please try another one!`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      mssg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // console.log('Error💥💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  } else {
    if (err.isOperational) {
      console.log(err.name);
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        mssg: err.message,
      });
    } else {
      // console.log('Error💥💥', err);
      res.status(500).render('error', {
        title: 'Something went wrong!',
        message: 'Please try again later.',
      });
    }
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    if (err.name === 'CastError') err = handleCastError(err);
    if (err.name === 'MongoError') err = handleDuplicateFieldsError(err);
    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpireError();

    sendErrorProd(err, req, res);
  }
};

module.exports = globalErrorHandler;
