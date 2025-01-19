const { Router } = require("express");
const deliveryController = require("../../controller/admin/deliveryController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const router = Router();

router.get(
  "/api/deliveries",
  adminValidateToken,
  deliveryController.getDelivery
);
router.get(
  "/api/deliveries/role",
  adminValidateToken,
  deliveryController.getDeliveryByRole
);
router.get(
  "/api/delivery/track/:quoteId",
  adminValidateToken,
  deliveryController.getDeliveryHistoryByQuoteId
);

router.post(
  "/api/delivery",
  adminValidateToken,
  deliveryController.postDelivery
);

router.put(
  "/api/delivery/:id",
  adminValidateToken,
  deliveryController.editDelivery
);
router.delete(
  "/api/delivery/:id",
  adminValidateToken,

  deliveryController.deleteDelivery
);

module.exports = router;
