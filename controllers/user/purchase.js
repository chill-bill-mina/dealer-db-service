const Purchase = require("../../models/purchase");
const Product = require("../../models/product");
exports.buy = async (req, res) => {
  const { productId, ownerName, email, phoneNumber, quantity } = req.body;
  const buyerAddress = req.user.address;

  try {
    const product = await Product.findOne({ productId });
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
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPurchase = async (req, res) => {
  const purchaseId = req.params.id;

  try {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) return res.status(404).send("No purchase found");

    const product = await Product.findById(purchase.product);
    if (!product) return res.status(404).send("Product couldn't find");

    const GetPurchase = {
      product: product,
      saleDate: purchase.createdAt,
      zkAppAddress: purchase.contractDetails.contractAddress,
      status: purchase.status,
    };
    res.json(GetPurchase);
  } catch (err) {
    console.error("An error occurred while getting purchase details:", err);

    if (err.kind === "ObjectId") {
      return res.status(400).send("Invalid purchase ID format");
    }

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
