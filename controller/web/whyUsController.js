const { queryPromise } = require("../../helper/query");

module.exports.getWhyUs = async (req, res, next) => {
  try {
    const sqlSelect = `SELECT * FROM why_us`;
    const data = await queryPromise(sqlSelect);

    res.status(200).json({
      message: "Data Fetched Successfully",
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};