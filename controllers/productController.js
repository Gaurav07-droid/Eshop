const multer = require('multer');
const sharp = require('sharp');

const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const ApiFeatures = require('../utils/ApiFeatures');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image !Please upload only image', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadProductImages = upload.array('images', 4);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (req.files.length == 0)
    return next(new AppError('you must provide product images', 400));

  req.body.images = [];
  await Promise.all(
    req.files.map(async (img, i) => {
      const imageName = `product-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/productimage/${imageName}`);
      req.body.images.push(imageName);
    })
  );

  console.log();
  next();
});

exports.aliasingProducts = (req, res, next) => {
  req.query.limit = 10;
  req.query.sort = 'price';
  req.query.fields = 'name price description image';
  next();
};

// const addProductToCategory = async (product) => {
//   try {
//     const productCategory = await Category.find({ name: product.categeory });
//     console.log(productCategory);
//     console.log(productCategory.length);

//     if (productCategory.length != 0) {
//       productCategory.products.;
//     }
//   } catch (err) {
//     console.log(err, err.message);
//   }
// };

exports.createProduct = catchAsync(async (req, res, next) => {
  // if (req.body.highlights) {
  //   req.body.highlights.split(',').join('\n');
  // }

  const product = await Product.create(req.body);

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const feature = new ApiFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limiting()
    .pagination();

  const product = await feature.query;

  if (!product)
    return next(new AppError('Sorry no products found!Please try again', 404));

  res.status(200).json({
    status: 'success',
    results: product.length,
    data: product,
  });
});

exports.getAProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).select('-__v');

  if (!product)
    return next(
      new AppError('Sorry no product found with tha Id!Please try again', 404)
    );

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.id);

  res.status(404).json({
    status: 'success',
  });
});

exports.getProductStats = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $match: { ratingsAverage: { $gte: 3.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$categeory' },
          items: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      categeories: products.length,
      data: products,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      messag: err,
    });
  }
};

var search = [];

catchAsync(async () => {
  const products = await Product.find();

  products.forEach((el) => {
    search.push(el.name, el.categeory);
  });
  // console.log(search);
  // console.log(search.includes('shoes'));
})();
