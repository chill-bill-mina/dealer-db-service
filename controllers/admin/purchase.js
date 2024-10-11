const Purchase = require("../../models/purchase");
const Product = require("../../models/product");
const { generateInvoiceNumber } = require("../../utils/invoice");
exports.getPendingPurchases = async (req, res) => {
  try {
    const pendingPurchases = await Purchase.find({
      status: "pending",
    }).populate("product");

    const purchasesWithData = pendingPurchases.map((purchase) => {
      const product = purchase.product;
      return {
        purchaseId: purchase._id,
        productID: product.productId,
        saleDate: purchase.createdAt,
        productName: product.name,
        ownerName: purchase.ownerName,
        ownerAddress: purchase.buyer,
        price: product.price,
        imageUrl: product.imageUrl,
        email: purchase.email,
        phoneNumber: purchase.phoneNumber,
        productDescription: product.description || "",
        vatAmount: product.vatAmount || 0,
        discountAmount: product.discountAmount || 0,
        quantity: purchase.quantity || 1,
        invoiceNumber: purchase.invoiceNumber || "",
      };
    });

    res.json(purchasesWithData);
  } catch (err) {
    console.error("Error while retrieving pending purchases:", err);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.setTransactionHash = async (req, res) => {
  const purchaseId = req.params.purchaseId;
  const { transactionHash } = req.body;

  try {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) return res.status(404).send("No purchase found");

    purchase.transactionHash = transactionHash;
    await purchase.save();

    res.json({ message: "Transaction hash saved" });
  } catch (err) {
    console.error("Error while saving transaction hash:", err);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.approvePurchase = async (req, res) => {
  const purchaseId = req.params.id;
  const { contractAddress } = req.body;

  try {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) return res.status(404).send("No purchase found");

    if (purchase.status !== "pending") {
      return res.status(400).send("Purchase has already been processed");
    }

    purchase.status = "completed";

    if (!purchase.invoiceNumber) {
      purchase.invoiceNumber = generateInvoiceNumber();
    }

    await purchase.save();

    const product = await Product.findById(purchase.product);
    product.owner = purchase.buyer;
    product.contractAddress = contractAddress;
    await product.save();

    res.json({ message: "Purchase completed" });
  } catch (err) {
    console.error("Purchase error:", err);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
