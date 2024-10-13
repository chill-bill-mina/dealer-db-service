const express = require("express");
const router = express.Router();
const purchaseController = require("../../controllers/admin/purchase");
const adminAuth = require("../../middleware/admin/auth");
router.get(
  "/pending-purchases",
  adminAuth,
  purchaseController.getPendingPurchases
);

router.post(
  "/approve-purchase/:id",
  adminAuth,
  purchaseController.approvePurchase
);

router.post("/deploy/:purchaseId", purchaseController.setDeployment);

router.post("/initialize/:purchaseId", purchaseController.initializeContract);

router.post("/sell/:purchaseId", purchaseController.sellContract);

module.exports = router;
