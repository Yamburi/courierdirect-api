const { z } = require("zod");

const editContentSchema = z.object({
  aim: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
});

module.exports = { editContentSchema };
