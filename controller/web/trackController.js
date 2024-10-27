const { postTrackSchema } = require("../../schema/trackSchema");
const axios = require("axios");
module.exports.postTrack = async (req, res, next) => {
  try {
    const validatedBody = postTrackSchema.parse(req.body);

    const response = await axios.post(
      "https://courierdirect.couriermate.co.za/api/json",
      {
        username: process.env.CDUSER,
        password: process.env.CDPASSWORD,
        method: "get_tracking_events",
        delivery_no: validatedBody.trackNo,
      }
    );
    res.status(201).json({
      message: "Tracking Data Fetched Successfully",
      success: true,
      data: response.data,
    });
  } catch (error) {
    next(error);
  }
};
