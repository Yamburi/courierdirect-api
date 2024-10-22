const { v4: uuidv4 } = require("uuid");

const { queryPromise } = require("../../helper/query");
const { NotFoundError } = require("../../helper/errors");
const { editContentSchema } = require("../../schema/contentSchema");
module.exports.getContent = async (req, res, next) => {
  try {
    const sqlSelect = `SELECT * FROM content`;
    const data = await queryPromise(sqlSelect);

    res.status(200).json({
      message: "Data Fetched Successfully",
      success: true,
      data: data[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports.editContent = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }

    const id = req.params.id;
    const validatedBody = editContentSchema.parse(req.body);

    const existingData = await queryPromise(
      "SELECT * FROM content WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    const sqlUpdate = "UPDATE content SET aim=?,about=? WHERE id = ?";
    await queryPromise(sqlUpdate, [validatedBody.aim, validatedBody.about, id]);

    const updatedData = await queryPromise(
      "SELECT * FROM content WHERE id = ?",
      [id]
    );
    res.status(200).json({
      message: "Data Updated Successfully",
      success: true,
      data: updatedData[0],
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
