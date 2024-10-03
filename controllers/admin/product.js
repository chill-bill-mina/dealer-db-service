const Product = require("../../models/product");
const { where } = require("../../models/user");

exports.createProduct = async (req, res, next) => {
  //   try {
  const {
    productId,
    name,
    price,
    productSerie,
    imageUrl,
    vatAmount,
    discountAmount,
    description,
    features,
  } = req.body;

  //   const product = await Product.find({ productId: productId });
  //   if (product) return res.status(402).send("Product already exists");

  const newProduct = new Product({
    name: name,
    productId: productId,
    price: price,
    productSerie: productSerie,
    imageUrl: imageUrl,
    vatAmount: vatAmount,
    discountAmount: discountAmount,
    description: description,
    features: features,
  });
  await newProduct.save();
  res.status(201).json({
    message: "Product created",
    productId: newProduct._id,
  });
  //   } catch (err) {
  //     console.error("Error while creating product:", err);
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }
  //     next(err);
  //   }
};
