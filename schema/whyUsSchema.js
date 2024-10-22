const { z } = require("zod");

const postWhyUsSchema = z.object({
  description: z.string().nonempty("Description is required"),
});

const editWhyUsSchema = postWhyUsSchema.partial();

module.exports = { postWhyUsSchema, editWhyUsSchema };
