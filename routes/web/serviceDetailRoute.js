const { Router } = require("express");
const serviceDetailController = require("../../controller/web/serviceDetailController");
const router = Router();

router.get("/api/web/service-detail", serviceDetailController.getServiceDetail);

module.exports = router;
