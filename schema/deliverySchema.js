const { z } = require("zod");

const postDeliverySchema = z.object({
  quote_id: z.string().nonempty("Quote Id is required"),
  receiver_name: z.string().optional().nullable(),
});

const editDeliverySchema = z.object({
  status: z.string().nonempty("Status is required"),
  receiver_name: z.string().optional().nullable(),
});

module.exports = { postDeliverySchema, editDeliverySchema };
