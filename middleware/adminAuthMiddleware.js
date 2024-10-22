const jwt = require("jsonwebtoken");
const { AuthorizationError } = require("../helper/errors");

const adminValidateToken = (req, res, next) => {
  const accessToken = req?.headers?.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    return next(new AuthorizationError("Access token is invalid or expired"));
  }

  try {
    const validToken = jwt.verify(accessToken, process.env.ADMIN_SECRET_KEY);
    if (!validToken) {
      return next(new AuthorizationError("Error verifying access token"));
    }

    req.admin = {
      email: validToken.email,
      role: validToken.role,
      id: validToken.id,
    };
    next();
  } catch (error) {
    return next(new AuthorizationError("Error verifying access token"));
  }
};

module.exports = { adminValidateToken };
