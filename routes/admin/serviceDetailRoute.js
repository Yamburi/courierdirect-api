const { Router } = require("express");
const serviceDetailController = require("../../controller/admin/serviceDetailController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const router = Router();

router.get(
  "/api/service-detail",
  adminValidateToken,
  serviceDetailController.getServiceDetail
);

router.post(
  "/api/service-detail",
  adminValidateToken,
  serviceDetailController.postServiceDetail
);

router.put(
  "/api/service-detail/:id",
  adminValidateToken,
  serviceDetailController.editServiceDetail
);
router.delete(
  "/api/service-detail/:id",
  adminValidateToken,

  serviceDetailController.deleteServiceDetail
);

module.exports = router;
