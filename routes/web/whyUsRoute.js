const { Router } = require("express");
const whyUsController = require("../../controller/web/whyUsController");
const router = Router();

router.get("/api/web/why-us", whyUsController.getWhyUs);

module.exports = router;
