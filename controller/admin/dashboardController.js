const db = require("../../db");

module.exports.getTotalCounts = async (req, res, next) => {
  try {
    // if (req.user.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const [
      serviceResult,
      serviceDetailResult,
      whyUsResult,
      queryResult,
      sliderResult,
      testimonialResult,
      faqResult,
    ] = await Promise.all([
      executeQuery("SELECT COUNT(*) AS serviceCount FROM service"),
      executeQuery("SELECT COUNT(*) AS serviceDetailCount FROM service_detail"),
      executeQuery("SELECT COUNT(*) AS whyUsCount FROM why_us"),
      executeQuery("SELECT COUNT(*) AS queryCount FROM query"),
      executeQuery("SELECT COUNT(*) AS sliderCount FROM slider"),

      executeQuery("SELECT COUNT(*) AS testimonialCount FROM testimonial"),
      executeQuery("SELECT COUNT(*) AS faqCount FROM faq"),
    ]);

    const serviceCount = serviceResult[0]?.serviceCount;
    const serviceDetailCount = serviceDetailResult[0]?.serviceDetailCount;
    const whyUsCount = whyUsResult[0]?.whyUsCount;
    const queryCount = queryResult[0]?.queryCount;
    const sliderCount = sliderResult[0]?.sliderCount;

    const testimonialCount = testimonialResult[0]?.testimonialCount;
    const faqCount = faqResult[0]?.faqCount;

    return res.status(200).json({
      success: true,
      message: "Data Fetched Successfully",
      data: {
        serviceCount,
        serviceDetailCount,
        whyUsCount,
        queryCount,
        sliderCount,
        testimonialCount,
        faqCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

function executeQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
