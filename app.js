//third party modules
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

//security practices
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const compression = require('compression');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

//user defined modules
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const cartRouter = require('./routes/cartRoutes');
const viewRouter = require('./routes/viewRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const bookingRouter = require('./routes/bookingRoutes');

// const { json } = require('express');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser()); // reading cookie from the browser

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

dotenv.config({ path: `${__dirname}/config.env` });

app.use(express.json({ limit: '25kb' }));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(hpp({ whitelist: ['ratingsAverage, price categeory '] }));
// app.use(xss());
app.use(mongoSanitize());

app.use(cors());
app.options('*', cors());
app.use('/api', apiLimiter);

app.use(compression());

//Routes
app.use('/', viewRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} route on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
