const { BadRequestError, NotFoundError } = require("../../helper/errors");
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

module.exports.getDeliveryHistoryByQuoteId = async (req, res, next) => {
  try {
    const { quoteId } = req.params;

    if (!quoteId) {
      throw new BadRequestError("Quote Id is required.");
    }

    const delivery = await queryPromise(
      `
        SELECT * FROM deliveries
        WHERE quote_id = ?
      `,
      [quoteId]
    );

    if (delivery.length === 0) {
      throw new NotFoundError("Delivery Not Found");
    }

    const deliveryId = delivery[0].id;

    const history = await queryPromise(
      `
        SELECT * FROM delivery_history
        WHERE delivery_id = ?
        ORDER BY created_at ASC
      `,
      [deliveryId]
    );

    res.status(200).json({
      message: "Delivery history fetched successfully.",
      success: true,
      data: {
        delivery: delivery[0],
        history: history,
      },
    });
  } catch (error) {
    next(error);
  }
};
