const { z } = require("zod");

const updatePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(6, "Old Password should be at least 6 characters long"),
  newPassword: z
    .string()
    .min(6, "New Password should be at least 6 characters long"),
});

module.exports = {
  updatePasswordSchema,
};
