const { z } = require("zod");

const postLoginSchema = z.object({
  email: z.string().email("Invalid email format").nonempty("Email is required"),
  password: z
    .string()
    .min(6, "Password should be at least 6 characters long")
    .nonempty("Password is required"),
});

const healthCheckSchema = z.object({
  token: z.string().nonempty("Token is required"),
});

module.exports = {
  postLoginSchema,
  healthCheckSchema,
};
