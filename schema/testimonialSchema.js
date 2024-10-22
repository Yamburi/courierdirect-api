const { z } = require("zod");

const postTestimonialSchema = z.object({
  name: z.string().nonempty("Name is required"),
  designation: z.string().nonempty("Designation is required"),
  rating: z.union([
    z.string().nonempty("Rating is required"),
    z.number().nonnegative("Rating must be a non-negative number"),
  ]),
  message: z.string().nonempty("Message is required"),
});

const editTestimonialSchema = postTestimonialSchema.partial();

module.exports = { postTestimonialSchema, editTestimonialSchema };
