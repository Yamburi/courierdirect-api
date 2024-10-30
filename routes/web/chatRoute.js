const { Router } = require("express");
const chatController = require("../../controller/web/chatController");
const { chatUpload } = require("../../middleware/fileUpload");

const router = Router();

router.post("/api/web/chat", chatController.createChat);
router.post(
  "/api/web/chat-reply/:userId/:id",

  chatUpload.fields([{ name: "image", maxCount: 10 }]),
  chatController.replyToChat
);

router.get(
  "/api/web/chat/:id",

  chatController.getChatDetails
);

router.get("/api/web/chat/new-message/:id", chatController.getNewMessages);
router.get(
  "/api/web/chat/unseen/:id",

  chatController.getUnseenCount
);

router.get(
  "/api/web/chat/new-unseen/:id",

  chatController.getNewUnseenCount
);

module.exports = router;
