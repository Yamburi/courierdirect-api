const { Router } = require("express");
const whyUsController = require("../../controller/admin/whyUsController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const { whyUsUpload } = require("../../middleware/fileUpload");
const router = Router();

router.get("/api/why-us", adminValidateToken, whyUsController.getWhyUs);

router.post(
  "/api/why-us",
  adminValidateToken,
  whyUsUpload.single("image"),
  whyUsController.postWhyUs
);

router.put(
  "/api/why-us/:id",
  adminValidateToken,
  whyUsUpload.single("image"),
  whyUsController.editWhyUs
);
router.delete(
  "/api/why-us/:id",
  adminValidateToken,

  whyUsController.deleteWhyUs
);

module.exports = router;
