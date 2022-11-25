const multer = require('multer');
const sharp = require('sharp');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadCategoryImage = upload.single('imageCover');

exports.resizeImage = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `category-${req.user.name}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 400)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/categoryImage/${req.file.filename}`);

  next();
};

exports.defaultProducts = catchAsync(async (req, res, next) => {
  const prdArr = [];
  const product = await Product.find({ categeory: req.body.name }); //here name is from category schema
  let defMinPrice = product[0] ? product[0].price : 0;

  //setting default min price
  for (let i = 0; i < product.length; i++) {
    if (product[i].price < defMinPrice) {
      defMinPrice = product[i].price;
    }
  }

  //adding ids of the products into the category
  for (let i = 0; i < product.length; i++) {
    prdArr.push(product[i].id);
  }

  if (!req.body.products) req.body.products = prdArr;
  if (!req.body.minPrice) req.body.minPrice = defMinPrice;

  next();
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create({
    name: req.body.name,
    minPrice: req.body.minPrice,
    imageCover: req.file.filename,
    products: req.body.products,
  });

  res.status(200).json({
    status: 'success',
    data: newCategory,
  });
});

exports.getAllCategory = catchAsync(async (req, res, next) => {
  const allCategory = await Category.find().select('-__v');

  if (!allCategory)
    return next(
      new AppError('Sorry coud\nt find any products in this category', 404)
    );

  res.status(200).json({
    status: 'success',
    data: allCategory,
  });
});

exports.getACategory = catchAsync(async (req, res, next) => {
  const aCategory = await Category.findById(req.params.id);

  if (!aCategory)
    return next(
      new AppError('Sorry coud\nt find any products in this category', 404)
    );

  res.status(200).json({
    status: 'success',
    data: aCategory,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: updatedCategory,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  await Category.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
  });
});
