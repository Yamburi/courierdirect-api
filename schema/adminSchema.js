const { z } = require("zod");

const postAdminSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email format").nonempty("Email is required"),
  role: z.string().nonempty("Role is required"),
  password: z.string().min(6, "Password should be at least 6 characters long"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  address: z.string().nonempty("Address is required"),
});

const changePasswordSchema = postAdminSchema.pick({ password: true });

const editAdminSchema = postAdminSchema.omit({ password: true });

module.exports = { postAdminSchema, changePasswordSchema, editAdminSchema };
