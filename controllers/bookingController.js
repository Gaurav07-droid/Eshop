const stripe = require('stripe')(
  'sk_test_51Ln0ePSALN1vrLI6UAMFYbtPNVu4SxG5ITAPfvYWdlUvgLDggcIyFhMS70qG3KDytBRu1BowHiqYqLAifdgALl2i00KPT8IoNi'
);
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/Email');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //get the product booked
  const product = await Product.findById(req.params.id);

  //create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-orders?product=${
      req.params.id
    }&user=${req.user.id}&price=${product.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/${
      product.categeory
    }/product/${product.id}`,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    line_items: [
      {
        price_data: {
          unit_amount: product.price * 100,
          currency: 'Inr',

          product_data: {
            name: `${product.name}`,
            description: product.description,
            images: [
              `https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8cGF5bWVudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60  `,
            ],
          },
        },

        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createOrderCheckout = catchAsync(async (req, res, next) => {
  const { product, user, price } = req.query;
  const url = `${req.protocol}://${req.get('host')}/my-orders`;
  if (!product && !user && !price) return next();

  const theCustomer = await User.findById(user);
  const theProduct = await Product.findById(product).select('name price');
  await new Email(theCustomer, theProduct).sendOrderSuccess();
  await Order.create({ product, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
  next();
});
