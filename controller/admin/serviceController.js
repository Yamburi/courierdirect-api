const { v4: uuidv4 } = require("uuid");

const { queryPromise } = require("../../helper/query");
const { NotFoundError, BadRequestError } = require("../../helper/errors");
const {
  postServiceSchema,
  editServiceSchema,
} = require("../../schema/serviceSchema");
const fs = require("fs").promises;

module.exports.getService = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }

    let sqlSelect = `SELECT * FROM service`;

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

module.exports.postService = async (req, res, next) => {
  let uploadedFile = null;
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const validatedBody = postServiceSchema.parse(req.body);

    const id = uuidv4();
    const file = req?.file?.filename;

    if (!file) {
      return next(new BadRequestError("Image is required"));
    }
    uploadedFile = file;

    const sqlInsert =
      "INSERT INTO service (id,name,description,image) VALUES (?, ?,?,?)";
    await queryPromise(sqlInsert, [
      id,
      validatedBody.name,
      validatedBody.description,
      file,
    ]);

    const insertedData = await queryPromise(
      "SELECT * FROM service WHERE id = ?",
      [id]
    );
    res.status(201).json({
      message: "Data Added Successfully",
      success: true,
      data: insertedData[0],
    });
  } catch (error) {
    if (uploadedFile) {
      try {
        await fs.unlink(`./uploads/service/${uploadedFile}`);
      } catch (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
      }
    }
    next(error);
  }
};

module.exports.editService = async (req, res, next) => {
  let uploadedFile = null;
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }

    const id = req.params.id;
    const validatedBody = editServiceSchema.parse(req.body);

    const existingData = await queryPromise(
      "SELECT * FROM service WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    const file = req?.file?.filename;

    let imageToUpdate = file ? file : existingData[0].image;
    uploadedFile = file;

    if (file && existingData[0]?.image) {
      try {
        await fs.unlink(`./uploads/service/${existingData[0].image}`);
      } catch (err) {
        console.error(
          `Failed to delete old image: ${existingData[0].image}`,
          err
        );
      }
    }

    const sqlUpdate =
      "UPDATE service SET  name=?,description=?, image=? WHERE id = ?";
    await queryPromise(sqlUpdate, [
      validatedBody.name,
      validatedBody.description,
      imageToUpdate,
      id,
    ]);

    const updatedData = await queryPromise(
      "SELECT * FROM service WHERE id = ?",
      [id]
    );
    res.status(200).json({
      message: "Data Updated Successfully",
      success: true,
      data: updatedData[0],
    });
  } catch (error) {
    if (uploadedFile) {
      try {
        await fs.unlink(`./uploads/service/${uploadedFile}`);
      } catch (err) {
        console.error(`Failed to delete file: ${uploadedFile}`, err);
      }
    }
    next(error);
  }
};

module.exports.deleteService = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const id = req.params.id;

    const existingData = await queryPromise(
      "SELECT * FROM service WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");
    if (existingData[0]?.image) {
      try {
        await fs.unlink(`./uploads/service/${existingData[0].image}`);
      } catch (err) {
        console.error(
          `Failed to delete old image: ${existingData[0].image}`,
          err
        );
      }
    }

    await queryPromise("DELETE FROM service WHERE id = ?", [id]);
    res.status(200).json({
      message: "Data Deleted Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
