const { Router } = require("express");
const testimonialController = require("../../controller/web/testimonialController");
const router = Router();

router.get("/api/web/testimonial", testimonialController.getTestimonial);

module.exports = router;
