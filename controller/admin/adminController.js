const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const { queryPromise } = require("../../helper/query");
const {
  NotFoundError,
  ConflictError,
  AuthorizationError,
} = require("../../helper/errors");
const {
  postAdminSchema,
  changePasswordSchema,
  editAdminSchema,
} = require("../../schema/adminSchema");

const omitPassword = (admin) => {
  const { password, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};

module.exports.getAdmin = async (req, res, next) => {
  try {
    if (req.admin.role !== "Admin") {
      return next(new AuthorizationError("Forbidden: Access is denied"));
    }

    const { role, startDate, endDate } = req.query;
    let whereClause = "WHERE email != 'courierdirect@gmail.com'";
    if (role) {
      whereClause += ` AND role = '${role}'`;
    }
    if (startDate !== undefined && endDate !== undefined) {
      whereClause += ` AND created_at BETWEEN '${startDate}' AND '${endDate}'`;
    } else if (startDate !== undefined) {
      whereClause += ` AND created_at >= '${startDate}'`;
    }

    const sqlSelect = `SELECT * FROM admin ${whereClause} `;
    const data = await queryPromise(sqlSelect);

    const adminsWithoutPasswords = data.map(omitPassword);

    res.status(200).json({
      message: "Data Fetched Successfully",
      success: true,
      data: adminsWithoutPasswords,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.postAdmin = async (req, res, next) => {
  try {
    if (req.admin.role !== "Admin") {
      return next(new AuthorizationError("Forbidden: Access is denied"));
    }
    const validatedBody = postAdminSchema.parse(req.body);

    const id = uuidv4();

    const existingAdmin = await queryPromise(
      "SELECT * FROM admin WHERE email = ?",
      [validatedBody.email]
    );
    if (existingAdmin.length > 0)
      throw new ConflictError("Email Already Exists");

    const hashedPassword = await bcrypt.hash(validatedBody.password, 10);
    const sqlInsert =
      "INSERT INTO admin (id,name,phone, email,address, role, password) VALUES (?, ?, ?, ?,?,?,?)";
    await queryPromise(sqlInsert, [
      id,
      validatedBody.name,
      validatedBody.phone,
      validatedBody.email,
      validatedBody.address,
      validatedBody.role,
      hashedPassword,
    ]);

    const insertedData = await queryPromise(
      "SELECT * FROM admin WHERE id = ?",
      [id]
    );
    const adminWithoutPassword = omitPassword(insertedData[0]);
    res.status(201).json({
      message: "Data Added Successfully",
      success: true,
      data: adminWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getAdminById = async (req, res, next) => {
  try {
    if (req.admin.role !== "Admin") {
      return next(new AuthorizationError("Forbidden: Access is denied"));
    }
    const id = req.params.id;
    const data = await queryPromise("SELECT * FROM admin WHERE id = ?", [id]);
    if (data.length === 0) throw new NotFoundError("Data Not Found");
    const adminWithoutPassword = omitPassword(data[0]);
    res.status(200).json({
      message: "Data Fetched Successfully",
      success: true,
      data: adminWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    if (req.admin.role !== "Admin") {
      return next(new AuthorizationError("Forbidden: Access is denied"));
    }
    const id = req.params.id;
    const validatedBody = changePasswordSchema.parse(req.body);

    const existingData = await queryPromise(
      "SELECT * FROM admin WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    const hashedNewPassword = await bcrypt.hash(validatedBody.password, 10);
    await queryPromise("UPDATE admin SET password = ? WHERE id = ?", [
      hashedNewPassword,
      id,
    ]);

    const updatedAdmin = await queryPromise(
      "SELECT * FROM admin WHERE id = ?",
      [id]
    );
    const adminWithoutPassword = omitPassword(updatedAdmin[0]);
    res.status(200).json({
      message: "Password Changed Successfully",
      success: true,
      data: adminWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.editAdmin = async (req, res, next) => {
  try {
    if (req.admin.role !== "Admin") {
      return next(new AuthorizationError("Forbidden: Access is denied"));
    }
    const id = req.params.id;
    const validatedBody = editAdminSchema.parse(req.body);

    const existingData = await queryPromise(
      "SELECT * FROM admin WHERE id = ?",
      [id]
    );
    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    const sqlUpdate =
      "UPDATE admin SET name=?,phone=?, email = ?, role = ?,address=? WHERE id = ?";
    await queryPromise(sqlUpdate, [
      validatedBody.name,
      validatedBody.phone,
      validatedBody.email,
      validatedBody.role,
      validatedBody.address,
      id,
    ]);

    const updatedData = await queryPromise("SELECT * FROM admin WHERE id = ?", [
      id,
    ]);
    const adminWithoutPassword = omitPassword(updatedData[0]);
    res.status(200).json({
      message: "Data Updated Successfully",
      success: true,
      data: adminWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteAdmin = async (req, res, next) => {
  try {
    if (req.admin.role !== "Admin") {
      return next(new AuthorizationError("Forbidden: Access is denied"));
    }
    const id = req.params.id;

    const existingAdmin = await queryPromise(
      "SELECT * FROM admin WHERE id = ?",
      [id]
    );
    if (existingAdmin.length === 0) throw new NotFoundError("Data Not Found");

    await queryPromise("DELETE FROM admin WHERE id = ?", [id]);
    res.status(200).json({
      message: "Data Deleted Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
