const bcrypt = require("bcrypt");
const { updatePasswordSchema } = require("../../schema/changePasswordSchema");
const { queryPromise } = require("../../helper/query");
const { BadRequestError } = require("../../helper/errors");

module.exports.updatePassword = async (req, res, next) => {
  try {
    const validatedBody = updatePasswordSchema.parse(req.body);

    const existingData = await queryPromise(
      `SELECT * FROM admin WHERE email = ?`,
      [req.admin.email]
    );

    if (existingData.length === 0) throw new NotFoundError("Data Not Found");

    const admin = existingData[0];

    const passwordMatch = await bcrypt.compare(
      validatedBody.oldPassword,
      admin.password
    );

    if (!passwordMatch) {
      throw new BadRequestError("Old Password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(validatedBody.newPassword, 10);

    await queryPromise(`UPDATE admin SET password = ? WHERE email = ?`, [
      newPasswordHash,
      admin.email,
    ]);

    return res.status(200).json({
      message: "Password Changed Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
