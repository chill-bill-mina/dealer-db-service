const express = require("express");
const router = express.Router();
const userAuthController = require("../../controllers/user/auth");

router.post("/nonce", userAuthController.getNonce);

router.post("/verify", userAuthController.verify);

module.exports = router;
