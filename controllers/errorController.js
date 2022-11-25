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
  return new AppError(`Invalid ${err.path}: ${err.value}`, 404);
};

const handleDuplicateFieldsError = (err) => {
  const value = err.errmssg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}.Please try another one!`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
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
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    if (err.name === 'CastError') err = handleCastError(err);
    if (err.name === 'MongoError') err = handleDuplicateFieldsError(err);
    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpireError();

    sendErrorProd(err, res);
  }
};

module.exports = globalErrorHandler;
