const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/product");
const adminAuth = require("../../middleware/admin/auth");

router.post("/add-product", adminAuth, productController.createProduct);

module.exports = router;
