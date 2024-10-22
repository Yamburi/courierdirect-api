const { queryPromise } = require("../../helper/query");

module.exports.getService = async (req, res, next) => {
  try {
    let sqlSelect = `SELECT * FROM service ORDER BY updated_at DESC`;

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
