const { Router } = require("express");
const trackController = require("../../controller/web/trackController");
const router = Router();

router.post("/api/web/track", trackController.postTrack);
router.get(
  "/api/web/track/:quoteId",
  trackController.getDeliveryHistoryByQuoteId
);

module.exports = router;
