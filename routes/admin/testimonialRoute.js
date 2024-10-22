const { Router } = require("express");
const testimonialController = require("../../controller/admin/testimonialController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const { testimonialUpload } = require("../../middleware/fileUpload");
const router = Router();

router.get(
  "/api/testimonial",
  adminValidateToken,
  testimonialController.getTestimonial
);

router.post(
  "/api/testimonial",
  adminValidateToken,
  testimonialUpload.single("image"),
  testimonialController.postTestimonial
);

router.get(
  "/api/testimonial/:id",
  adminValidateToken,
  testimonialController.getTestimonialById
);

router.put(
  "/api/testimonial/:id",

  adminValidateToken,
  testimonialUpload.single("image"),
  testimonialController.editTestimonial
);
router.delete(
  "/api/testimonial/:id",
  adminValidateToken,

  testimonialController.deleteTestimonial
);
module.exports = router;
