const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    productSerie: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    price: { type: Number, required: true },
    vatAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    description: { type: String },
    contractAddress: { type: String },
    features: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
