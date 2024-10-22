const { Router } = require("express");
const changePasswordController = require("../../controller/admin/changePasswordController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const router = Router();

router.put(
  "/api/change-password",

  adminValidateToken,
  changePasswordController.updatePassword
);

module.exports = router;
