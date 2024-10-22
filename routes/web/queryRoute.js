const { Router } = require("express");
const queryController = require("../../controller/web/queryController");
const router = Router();

router.post("/api/web/contact", queryController.postQuery);

module.exports = router;
