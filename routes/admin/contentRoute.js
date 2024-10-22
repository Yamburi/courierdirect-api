const { Router } = require("express");
const contentController = require("../../controller/admin/contentController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const router = Router();

router.get("/api/content", adminValidateToken, contentController.getContent);

router.put(
  "/api/content/:id",
  adminValidateToken,
  contentController.editContent
);

module.exports = router;
