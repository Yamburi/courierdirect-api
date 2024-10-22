const { Router } = require("express");
const faqController = require("../../controller/web/faqController");
const router = Router();

router.get("/api/web/faq", faqController.getFAQ);

module.exports = router;
