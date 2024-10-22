const { z } = require("zod");

const postFAQSchema = z.object({
  question: z.string().nonempty("Question is required"),
  answer: z.string().nonempty("Answer is required"),
});

const editFAQSchema = postFAQSchema.partial();

module.exports = { postFAQSchema, editFAQSchema };
