const express = require("express");
const router = express.Router();
const auth = require("../../middleware/user/auth");
const purchaseController = require("../../controllers/user/purchase");

router.post("/buy", auth, purchaseController.buy);

module.exports = router;
