const { z } = require("zod");

const postServiceDetailSchema = z.object({
  icon: z.string().nonempty("Icon is required"),
  name: z.string().nonempty("Name is required"),
  description: z.string().nonempty("Description is required"),
});

const editServiceDetailSchema = postServiceDetailSchema.partial();

module.exports = { postServiceDetailSchema, editServiceDetailSchema };
