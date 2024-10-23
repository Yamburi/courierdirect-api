const { Router } = require("express");
const chatController = require("../../controller/admin/chatController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const { chatUpload } = require("../../middleware/fileUpload");

const router = Router();

router.post(
  "/api/chat-reply/:id",
  adminValidateToken,
  chatUpload.fields([{ name: "image", maxCount: 10 }]),
  chatController.replyToChat
);
router.get("/api/chat", adminValidateToken, chatController.getAllChats);
router.get("/api/chat/:id", adminValidateToken, chatController.getChatDetails);
router.delete("/api/chat/:id", adminValidateToken, chatController.deleteChat);

module.exports = router;
