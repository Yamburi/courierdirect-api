const { Router } = require("express");
const contentController = require("../../controller/web/contentController");
const router = Router();

router.get("/api/web/content", contentController.getContent);

module.exports = router;
