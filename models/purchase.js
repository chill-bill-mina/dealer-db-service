const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  buyer: { type: String, required: true }, // user public key
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  invoiceNumber: { type: String },
  transactionHash: { type: String },
  isDeployed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
