const { Router } = require("express");
const sliderController = require("../../controller/admin/sliderController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const { sliderUpload } = require("../../middleware/fileUpload");
const router = Router();

router.get("/api/slider", adminValidateToken, sliderController.getSlider);

router.post(
  "/api/slider",
  adminValidateToken,
  sliderUpload.single("image"),
  sliderController.postSlider
);

router.put(
  "/api/slider/:id",

  adminValidateToken,
  sliderUpload.single("image"),
  sliderController.editSlider
);
router.delete(
  "/api/slider/:id",
  adminValidateToken,

  sliderController.deleteSlider
);
module.exports = router;
