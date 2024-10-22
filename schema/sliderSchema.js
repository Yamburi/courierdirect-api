const { z } = require("zod");

const postSliderSchema = z.object({
  link: z.string().optional().nullable(),
});

const editSliderSchema = postSliderSchema.partial();

module.exports = { postSliderSchema, editSliderSchema };
