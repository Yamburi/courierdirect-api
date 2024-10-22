const { Router } = require("express");
const serviceController = require("../../controller/admin/serviceController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const { serviceUpload } = require("../../middleware/fileUpload");
const router = Router();

router.get("/api/service", adminValidateToken, serviceController.getService);

router.post(
  "/api/service",
  adminValidateToken,
  serviceUpload.single("image"),
  serviceController.postService
);

router.put(
  "/api/service/:id",

  adminValidateToken,
  serviceUpload.single("image"),
  serviceController.editService
);
router.delete(
  "/api/service/:id",
  adminValidateToken,

  serviceController.deleteService
);
module.exports = router;
