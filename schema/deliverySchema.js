const { z } = require("zod");

const postDeliverySchema = z.object({
  quote_id: z.string().nonempty("Quote Id is required"),
});

const editDeliverySchema = z.object({
  status: z.string().nonempty("Status is required"),
});

module.exports = { postDeliverySchema, editDeliverySchema };
