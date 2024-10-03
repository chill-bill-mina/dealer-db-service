const express = require("express");
const router = express.Router();
const auth = require("../../middleware/user/auth");
const productController = require("../../controllers/user/product");

router.get("/my-products", auth, productController.getMyProducts);

router.get("/products", productController.getAllProducts);

router.get("/products/:id", productController.getProduct);

module.exports = router;
