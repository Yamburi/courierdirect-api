const { Router } = require("express");
const faqController = require("../../controller/admin/faqController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const router = Router();

router.get("/api/faq", adminValidateToken, faqController.getFAQ);

router.post("/api/faq", adminValidateToken, faqController.postFAQ);

router.put("/api/faq/:id", adminValidateToken, faqController.editFAQ);
router.delete(
  "/api/faq/:id",
  adminValidateToken,

  faqController.deleteFAQ
);

module.exports = router;
