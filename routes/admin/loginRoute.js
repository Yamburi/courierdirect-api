const { Router } = require("express");
const loginController = require("../../controller/admin/loginController");
const router = Router();

router.post("/api/admin/login", loginController.postLogin);
router.get("/api/admin/healthCheck", loginController.healthCheck);

module.exports = router;
