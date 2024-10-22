const { v4: uuidv4 } = require("uuid");

const { queryPromise } = require("../../helper/query");
const { NotFoundError } = require("../../helper/errors");
const { postFAQSchema, editFAQSchema } = require("../../schema/faqSchema");
const fs = require("fs").promises;
module.exports.getFAQ = async (req, res, next) => {
  try {
    const sqlSelect = `SELECT * FROM faq`;
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

module.exports.postFAQ = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const validatedBody = postFAQSchema.parse(req.body);

    const id = uuidv4();

    const sqlInsert = "INSERT INTO faq (id,question,answer) VALUES (?, ?,?)";
    await queryPromise(sqlInsert, [
      id,
      validatedBody.question,
      validatedBody.answer,
    ]);

    const insertedData = await queryPromise("SELECT * FROM faq WHERE id = ?", [
      id,
    ]);
    res.status(201).json({
      message: "Data Added Successfully",
      success: true,
      data: insertedData[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports.editFAQ = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }

    const id = req.params.id;
    const validatedBody = editFAQSchema.parse(req.body);

    const existingData = await queryPromise("SELECT * FROM faq WHERE id = ?", [
      id,
    ]);
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    const sqlUpdate = "UPDATE faq SET question=?,answer=? WHERE id = ?";
    await queryPromise(sqlUpdate, [
      validatedBody.question,
      validatedBody.answer,
      id,
    ]);

    const updatedData = await queryPromise("SELECT * FROM faq WHERE id = ?", [
      id,
    ]);
    res.status(200).json({
      message: "Data Updated Successfully",
      success: true,
      data: updatedData[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteFAQ = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const id = req.params.id;

    const existingData = await queryPromise("SELECT * FROM faq WHERE id = ?", [
      id,
    ]);
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    await queryPromise("DELETE FROM faq WHERE id = ?", [id]);
    res.status(200).json({
      message: "Data Deleted Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
