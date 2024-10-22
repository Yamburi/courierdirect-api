const { Router } = require("express");
const dashboardController = require("../../controller/admin/dashboardController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");

const router = Router();

router.get(
  "/api/dashboard/count",
  adminValidateToken,
  dashboardController.getTotalCounts
);

module.exports = router;
