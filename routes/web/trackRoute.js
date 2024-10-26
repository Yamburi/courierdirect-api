const { Router } = require("express");
const trackController = require("../../controller/web/trackController");
const router = Router();

router.post("/api/web/track", trackController.postTrack);

module.exports = router;
