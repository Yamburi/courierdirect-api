const { z } = require("zod");

const postQuerySchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email format").nonempty("Email is required"),
  phone: z.union([
    z.string().nonempty("Phone No. is required"),
    z.number().nonnegative("Phone No. must be a non-negative number"),
  ]),
  subject: z.string().nonempty("Subject is required"),
  message: z.string().nonempty("Message is required"),
});

const editQuerySchema = postQuerySchema.partial();

module.exports = { postQuerySchema, editQuerySchema };
