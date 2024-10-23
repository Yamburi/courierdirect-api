const { z } = require("zod");

const postChatSchema = z.object({
  user_id: z.string().nonempty("User Id"),
  name: z.string().nonempty("Name"),
  phone: z.union([
    z.string().nonempty("Phone Number is required"),
    z.number().nonnegative("Phone Number must be a non-negative number"),
  ]),
  email: z.string().nonempty("Email"),
  message: z.string().nonempty("Message"),
});

const replyChatSchema = z.object({
  message: z.string().nonempty("Message"),
});

module.exports = {
  postChatSchema,
  replyChatSchema,
};
