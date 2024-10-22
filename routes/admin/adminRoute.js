const { Router } = require("express");
const adminController = require("../../controller/admin/adminController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const router = Router();

router.get("/api/admin", adminValidateToken, adminController.getAdmin);

router.post("/api/admin", adminValidateToken, adminController.postAdmin);

router.get("/api/admin/:id", adminValidateToken, adminController.getAdminById);

router.put(
  "/api/admin/changepassword/:id",
  adminValidateToken,

  adminController.changePassword
);

router.put(
  "/api/admin/:id",
  adminValidateToken,

  adminController.editAdmin
);
router.delete(
  "/api/admin/:id",
  adminValidateToken,

  adminController.deleteAdmin
);
module.exports = router;
