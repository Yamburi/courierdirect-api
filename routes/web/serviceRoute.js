const { Router } = require("express");
const serviceController = require("../../controller/web/serviceController");
const router = Router();

router.get("/api/web/service", serviceController.getService);

module.exports = router;
