const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ─── SECURITY: CSP (allows Leaflet + OpenStreetMap + Stripe) ─────────────────
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", 'https://unpkg.com', 'https://js.stripe.com', "'unsafe-inline'"],
      workerSrc:  ["'self'", 'blob:'],
      frameSrc:   ["'self'", 'https://js.stripe.com'],
      connectSrc: ["'self'", 'https://api.stripe.com', 'https://*.openstreetmap.org'],
      imgSrc:     ["'self'", 'data:', 'blob:', 'https://*.tile.openstreetmap.org', 'https://unpkg.com'],
      styleSrc:   ["'self'", 'https://fonts.googleapis.com', 'https://unpkg.com', "'unsafe-inline'"],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com', 'https://unpkg.com'],
    },
  })
);

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({ max: 100, windowMs: 60 * 60 * 1000, message: 'Too many requests from this IP, please try again in an hour!' });
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price'] }));
app.use(compression());

app.use((req, res, next) => { req.requestTime = new Date().toISOString(); next(); });

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => { next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); });
app.use(globalErrorHandler);

module.exports = app;
