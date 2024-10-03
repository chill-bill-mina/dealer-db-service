const Purchase = require("../../models/purchase");
const Product = require("../../models/product");
exports.buy = async (req, res) => {
  const { productId, ownerName, email, phoneNumber, quantity } = req.body;
  const buyerAddress = req.user.address;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("Product couldn't find");

    const purchase = new Purchase({
      product: product._id,
      buyer: buyerAddress,
      ownerName,
      email,
      phoneNumber,
      quantity,
    });

    await purchase.save();

    res.status(201).json({
      message: "Purchase transaction created",
      purchaseId: purchase._id,
    });
  } catch (err) {
    console.error("Purchase Error:", err);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
