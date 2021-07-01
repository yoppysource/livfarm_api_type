import express from 'express';
import morgan from 'morgan';
import { AppError } from './src/errors/app-error';
import { errorHandler } from './src/middlewares/error-handler';
import { authRouter } from './src/routes/auth/auth-routes';
import path from 'path';
import { AuthPath } from './src/routes/auth/auth-routes-path';
import { UserPath } from './src/routes/user/user-routes-path';
import { userRouter } from './src/routes/user/user-routes';
import { InventoryPath } from './src/routes/inventory/inventory-routes-path';
import { inventoryRouter } from './src/routes/inventory/inventory-routes';
import { ProductPath } from './src/routes/product/product-routes';
import { productRouter } from './src/routes/product/product-routes-path';
import { reviewRouter } from './src/routes/review/review-routes-path';
import { ReviewPath } from './src/routes/review/review-routes';
import { StorePath } from './src/routes/store/store-routes';
import { storeRouter } from './src/routes/store/store-routes-path';
import { EventPath } from './src/routes/event/event-routes-path';
import { eventRouter } from './src/routes/event/event-routes';
import { cartRouter } from './src/routes/cart/cart-routes';
import { CartPath } from './src/routes/cart/cart-routes-path';
import { couponRouter } from './src/routes/coupon/coupon-routes';
import { CouponPath } from './src/routes/coupon/coupon-routes-path';
import { OrderPath } from './src/routes/order/order-routes-path';
import { orderRouter } from './src/routes/order/order-routes';
import { AppInfoPath } from './src/routes/appInfo/appInfo-routes-path';
import { appInfoRouter } from './src/routes/appInfo/appInfo-routes';

const app = express();
app.use(express.json());
app.use(morgan('tiny'));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public-flutter')));

/* GLOBAL MIDDLEWARE */

// // Set security HTTP headers
// app.use(helmet());
// // Development logging
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
// // Limit requests from same IP
// const limiter = rateLimit({
//   max: 100000,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!',
// });

// app.use('/api', limiter);

// // Body parser, reading data from body into req.body
// // Body larger than 10kb it will not be accepted
// app.use(
//   express.json({
//     limit: '10kb',
//   })
// );

// //Allow Cross-Origin Resource Sharing
// //TODO: For depolying it should be managed with whitelist
// // if (process.env.NODE_ENV === "development")
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );

// //Prevent malicious query injection
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// //Read Cookie
// app.use(cookieParser());
// // Data sanitization against NOSQL query injection
// app.use(mongoSanitize());
// // Data sanitization against XSS
// app.use(xss());

// // Add requestTime for debugging
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

/* API ROUTER */
app.use(AuthPath.BASE, authRouter);
app.use(UserPath.BASE, userRouter);
app.use(InventoryPath.BASE, inventoryRouter);
app.use(ProductPath.BASE, productRouter);
app.use(ReviewPath.BASE, reviewRouter);
app.use(StorePath.BASE, storeRouter);
app.use(EventPath.BASE, eventRouter);
app.use(CartPath.BASE, cartRouter);
app.use(CouponPath.BASE, couponRouter);
app.use(OrderPath.BASE, orderRouter);
app.use(AppInfoPath.BASE, appInfoRouter);

// //TODO: Implement.
// // //PRODUCT
// app.use('/api/v1/products', productRouter);

// // //SERVICE
// app.use('/api/v1/reviews', reviewRouter);
// app.use('/api/v1/coupons', couponRouter);
// // Cart Router include items as well.
// app.use('/api/v1/carts', cartRouter);
// app.use('/api/v1/orders', orderRouter);

// app.use('/api/v1/appInfo', appInfoRouter);
// app.use('/api/v1/openingHour', openingHourRouter);

// app.use('/api/v1/events', eventRouter);

app.all('*', async (_, __, next) => {
  return next(new AppError('요청하신 경로를 찾을 수 없습니다', 404));
});

app.use(errorHandler);

export { app };
