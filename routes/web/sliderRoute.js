const { Router } = require("express");
const sliderController = require("../../controller/web/sliderController");
const router = Router();

router.get("/api/web/slider", sliderController.getSlider);

module.exports = router;
