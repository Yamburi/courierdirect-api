const { v4: uuidv4 } = require("uuid");

const { queryPromise } = require("../../helper/query");
const { NotFoundError, BadRequestError } = require("../../helper/errors");
const {
  postWhyUsSchema,
  editWhyUsSchema,
} = require("../../schema/whyUsSchema");
const { deleteFile } = require("../../helper/unsync");

module.exports.getWhyUs = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }

    let sqlSelect = `SELECT * FROM why_us`;

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

module.exports.postWhyUs = async (req, res, next) => {
  let uploadedFile = null;
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const validatedBody = postWhyUsSchema.parse(req.body);

    const id = uuidv4();
    const file = req?.file?.filename;

    if (!file) {
      return next(new BadRequestError("Image is required"));
    }
    uploadedFile = file;

    const sqlInsert =
      "INSERT INTO why_us (id,description,image) VALUES (?, ?,?)";
    await queryPromise(sqlInsert, [id, validatedBody.description, file]);

    const insertedData = await queryPromise(
      "SELECT * FROM why_us WHERE id = ?",
      [id]
    );
    res.status(201).json({
      message: "Data Added Successfully",
      success: true,
      data: insertedData[0],
    });
  } catch (error) {
    if (uploadedFile) {
      deleteFile(`./uploads/why-us/${uploadedFile}`);
    }
    next(error);
  }
};

module.exports.editWhyUs = async (req, res, next) => {
  let uploadedFile = null;
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }

    const id = req.params.id;
    const validatedBody = editWhyUsSchema.parse(req.body);

    const existingData = await queryPromise(
      "SELECT * FROM why_us WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    const file = req?.file?.filename;

    let imageToUpdate = file ? file : existingData[0].image;
    uploadedFile = file;

    if (file && existingData[0]?.image) {
      deleteFile(`./uploads/why-us/${existingData[0].image}`);
    }
    const sqlUpdate = "UPDATE why_us SET  description=?, image=? WHERE id = ?";
    await queryPromise(sqlUpdate, [
      validatedBody.description,
      imageToUpdate,
      id,
    ]);

    const updatedData = await queryPromise(
      "SELECT * FROM why_us WHERE id = ?",
      [id]
    );
    res.status(200).json({
      message: "Data Updated Successfully",
      success: true,
      data: updatedData[0],
    });
  } catch (error) {
    if (uploadedFile) {
      deleteFile(`./uploads/why-us/${uploadedFile}`);
    }
    next(error);
  }
};

module.exports.deleteWhyUs = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const id = req.params.id;

    const existingData = await queryPromise(
      "SELECT * FROM why_us WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    if (file && existingData[0]?.image) {
      deleteFile(`./uploads/why-us/${existingData[0].image}`);
    }
    await queryPromise("DELETE FROM why_us WHERE id = ?", [id]);
    res.status(200).json({
      message: "Data Deleted Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
