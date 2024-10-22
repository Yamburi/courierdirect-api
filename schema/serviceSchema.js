const { z } = require("zod");

const postServiceSchema = z.object({
  name: z.string().nonempty("Name is required"),
  description: z.string().nonempty("Description is required"),
});

const editServiceSchema = postServiceSchema.partial();

module.exports = { postServiceSchema, editServiceSchema };
