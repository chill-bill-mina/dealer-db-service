const express = require("express");
const router = express.Router();

const adminAuthController = require("../../controllers/admin/auth");

router.post("/nonce", adminAuthController.getNonce);

router.post("/verify", adminAuthController.verify);
module.exports = router;
