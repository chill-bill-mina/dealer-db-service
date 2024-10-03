const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  nonce: { type: Number, default: () => Math.floor(Math.random() * 1000000) },
});

module.exports = mongoose.model("Admin", adminSchema);
