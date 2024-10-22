const { v4: uuidv4 } = require("uuid");

const { queryPromise } = require("../../helper/query");
const { NotFoundError } = require("../../helper/errors");
const {
  postServiceDetailSchema,
  editServiceDetailSchema,
} = require("../../schema/serviceDetailSchema");
const fs = require("fs").promises;
module.exports.getServiceDetail = async (req, res, next) => {
  try {
    const sqlSelect = `SELECT * FROM service_detail`;
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

module.exports.postServiceDetail = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const validatedBody = postServiceDetailSchema.parse(req.body);

    const id = uuidv4();

    const sqlInsert =
      "INSERT INTO service_detail (id,name,icon,description) VALUES (?, ?,?,?)";
    await queryPromise(sqlInsert, [
      id,
      validatedBody.name,
      validatedBody.icon,
      validatedBody.description,
    ]);

    const insertedData = await queryPromise(
      "SELECT * FROM service_detail WHERE id = ?",
      [id]
    );
    res.status(201).json({
      message: "Data Added Successfully",
      success: true,
      data: insertedData[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports.editServiceDetail = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }

    const id = req.params.id;
    const validatedBody = editServiceDetailSchema.parse(req.body);

    const existingData = await queryPromise(
      "SELECT * FROM service_detail WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    const sqlUpdate =
      "UPDATE service_detail SET name=?,icon=?,description=? WHERE id = ?";
    await queryPromise(sqlUpdate, [
      validatedBody.name,
      validatedBody.icon,
      validatedBody.description,
      id,
    ]);

    const updatedData = await queryPromise(
      "SELECT * FROM service_detail WHERE id = ?",
      [id]
    );
    res.status(200).json({
      message: "Data Updated Successfully",
      success: true,
      data: updatedData[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteServiceDetail = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const id = req.params.id;

    const existingData = await queryPromise(
      "SELECT * FROM service_detail WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    await queryPromise("DELETE FROM service_detail WHERE id = ?", [id]);
    res.status(200).json({
      message: "Data Deleted Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
