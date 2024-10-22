const { v4: uuidv4 } = require("uuid");

const { queryPromise } = require("../../helper/query");
const { NotFoundError } = require("../../helper/errors");
const {
  postTestimonialSchema,
  editTestimonialSchema,
} = require("../../schema/testimonialSchema");
const fs = require("fs").promises;
module.exports.getTestimonial = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }

    const sqlSelect = `SELECT * FROM testimonial`;
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

module.exports.postTestimonial = async (req, res, next) => {
  let uploadedFile = null;
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const validatedBody = postTestimonialSchema.parse(req.body);

    const id = uuidv4();
    const file = req?.file?.filename;

    if (!file) {
      return next(new BadRequestError("Image is required"));
    }
    uploadedFile = file;

    const sqlInsert =
      "INSERT INTO testimonial (id,name,designation,image,rating, message) VALUES (?, ?,?,?,?,?)";
    await queryPromise(sqlInsert, [
      id,
      validatedBody.name,
      validatedBody.designation,
      file,
      parseInt(validatedBody.rating),
      validatedBody.message,
    ]);

    const insertedData = await queryPromise(
      "SELECT * FROM testimonial WHERE id = ?",
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
        await fs.unlink(`./uploads/testimonial/${uploadedFile}`);
      } catch (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
      }
    }
    next(error);
  }
};

module.exports.getTestimonialById = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const id = req.params.id;
    const data = await queryPromise("SELECT * FROM testimonial WHERE id = ?", [
      id,
    ]);
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

module.exports.editTestimonial = async (req, res, next) => {
  let uploadedFile = null;
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }

    const id = req.params.id;
    const validatedBody = editTestimonialSchema.parse(req.body);

    const existingData = await queryPromise(
      "SELECT * FROM testimonial WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    const file = req?.file?.filename;

    let imageToUpdate = file ? file : existingData[0].image;
    uploadedFile = file;

    if (file) {
      await fs.unlink(`./uploads/testimonial/${existingData[0]?.image}`);
    }

    const sqlUpdate =
      "UPDATE testimonial SET name=?,designation=?, image=?, rating=?, message=? WHERE id = ?";
    await queryPromise(sqlUpdate, [
      validatedBody.name,
      validatedBody.designation,
      imageToUpdate,
      parseInt(validatedBody.rating),
      validatedBody.message,
      id,
    ]);

    const updatedData = await queryPromise(
      "SELECT * FROM testimonial WHERE id = ?",
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
        await fs.unlink(`./uploads/testimonial/${uploadedFile}`);
      } catch (err) {
        console.error(`Failed to delete file: ${uploadedFile}`, err);
      }
    }
    next(error);
  }
};

module.exports.deleteTestimonial = async (req, res, next) => {
  try {
    // if (req.admin.role !== "Admin") {
    //   return next(new AuthorizationError("Forbidden: Access is denied"));
    // }
    const id = req.params.id;

    const existingData = await queryPromise(
      "SELECT * FROM testimonial WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");
    await fs.unlink(`./uploads/testimonial/${existingData[0]?.image}`);
    await queryPromise("DELETE FROM testimonial WHERE id = ?", [id]);
    res.status(200).json({
      message: "Data Deleted Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
