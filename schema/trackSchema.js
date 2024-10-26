const { z } = require("zod");

const postTrackSchema = z.object({
  trackNo: z.string().nonempty("Name is required"),
});

module.exports = { postTrackSchema };
