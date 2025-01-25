const { Router } = require("express");
const deliveryController = require("../../controller/web/deliveryController");
const router = Router();

router.post("/api/web/create-delivery", deliveryController.postDelivery);

module.exports = router;
