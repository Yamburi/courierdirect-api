const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { queryPromise } = require("../../helper/query");
const { postLoginSchema } = require("../../schema/loginSchema");
const {
  AuthorizationError,
  NotFoundError,
  BadRequestError,
} = require("../../helper/errors");

module.exports.postLogin = async (req, res, next) => {
  try {
    const validatedBody = postLoginSchema.parse(req.body);

    const sqlCheckEmail = `SELECT * FROM admin WHERE email = ?`;
    const result = await queryPromise(sqlCheckEmail, [validatedBody.email]);

    if (result.length === 0) {
      return next(new NotFoundError("Admin Not Found"));
    }

    const admin = result[0];

    const passwordMatch = await bcrypt.compare(
      validatedBody.password,
      admin.password
    );

    if (!passwordMatch) {
      return next(new BadRequestError("Password is incorrect"));
    }

    const accessToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      process.env.ADMIN_SECRET_KEY,
      { expiresIn: "3d" }
    );

    return res.status(200).json({
      message: "Logged in successfully",
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        accessToken: accessToken,
        isLoggedIn: true,
      },
    });
  } catch (error) {
    next();
  }
};

module.exports.healthCheck = async (req, res, next) => {
  try {
    // healthCheckSchema.parse(req.headers);

    const token = req?.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new AuthorizationError("Access token is missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ADMIN_SECRET_KEY);

      const sqlGetAdmin = `SELECT * FROM admin WHERE id = ?`;
      const adminData = await queryPromise(sqlGetAdmin, [decoded.id]);

      if (adminData.length === 0) {
        return next(new NotFoundError("Admin Not Found"));
      }

      return res.status(200).json({
        message: "Token is valid",
        success: true,
        data: adminData,
      });
    } catch (error) {
      return next(new AuthorizationError("Token is invalid or expired"));
    }
  } catch (error) {
    next();
  }
};
