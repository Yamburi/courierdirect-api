const { queryPromise } = require("../../helper/query");
const { NotFoundError } = require("../../helper/errors");

module.exports.getQuery = async (req, res, next) => {
  try {
    const sqlSelect = `SELECT * FROM query ORDER by created_at DESC`;
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
module.exports.markQueryAsSeen = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sqlUpdate = "UPDATE query SET seen = 'seen' WHERE id = ?";
    await queryPromise(sqlUpdate, [id]);
    const updatedData = await queryPromise("SELECT * FROM query WHERE id = ?", [
      id,
    ]);
    res.status(200).json({
      message: "Query marked as seen",
      success: true,
      data: updatedData[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports.markAllQueriesAsSeen = async (req, res, next) => {
  try {
    const sqlUpdateAll = "UPDATE query SET seen = 'seen'";
    await queryPromise(sqlUpdateAll);
    const sqlSelect = `SELECT * FROM query ORDER by created_at DESC`;
    const data = await queryPromise(sqlSelect);

    res.status(200).json({
      message: "All queries marked as seen",
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getQueryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await queryPromise("SELECT * FROM query WHERE id = ?", [id]);
    if (data.length === 0) throw new NotFoundError("Data Not Found");
    res.status(200).json({
      message: "Data Fetched Successfully",
      success: true,
      data: data[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteQuery = async (req, res, next) => {
  try {
    const id = req.params.id;

    const existingData = await queryPromise(
      "SELECT * FROM query WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");
    await queryPromise("DELETE FROM query WHERE id = ?", [id]);
    res.status(200).json({
      message: "Data Deleted Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.countUnseenQueries = async (req, res, next) => {
  try {
    const sqlCountUnseen =
      "SELECT COUNT(*) AS unseenCount FROM query WHERE seen = 'unseen'";
    const result = await queryPromise(sqlCountUnseen);

    const unseenCount = result[0].unseenCount;

    res.status(200).json({
      message: "Unseen Queries Count Retrieved Successfully",
      success: true,
      data: unseenCount,
    });
  } catch (error) {
    next(error);
  }
};
