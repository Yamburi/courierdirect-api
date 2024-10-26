const { postTrackSchema } = require("../../schema/trackSchema");
module.exports.postTrack = async (req, res, next) => {
  try {
    const validatedBody = postTrackSchema.parse(req.body);

    const response = await axios.post(
      "https://support.couriermate.co.za/json_api/",
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
