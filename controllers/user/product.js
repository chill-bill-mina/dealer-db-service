const Purchase = require("../../models/purchase");
const Product = require("../../models/product");
exports.getMyProducts = async (req, res) => {
  const userAddress = req.user.address;

  try {
    const purchases = await Purchase.find({ buyer: userAddress }).populate(
      "product"
    );
    const result = purchases.map((purchase) => ({
      product: purchase.product,
      status: purchase.status,
      quantity: purchase.quantity,
      contractAddress: purchase.contractDetails.contractAddress,
      purchaseId: purchase._id,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error while retrieving user's products:", err);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}, "name imageUrl");
    res.json(products);
  } catch (err) {
    console.error("An error occurred while retrieving products:", err);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product couldn't find");
    }

    res.json(product);
  } catch (err) {
    console.error("An error occurred while getting product details:", err);

    if (err.kind === "ObjectId") {
      return res.status(400).send("Invalid product ID format");
    }

    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
