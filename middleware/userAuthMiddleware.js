const jwt = require("jsonwebtoken");
const { AuthorizationError } = require("../helper/errors");

const userValidateToken = (req, res, next) => {
  const accessToken = req?.headers?.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    return next(new AuthorizationError("Access token is invalid or expired"));
  }

  try {
    const validToken = jwt.verify(accessToken, process.env.USER_SECRET_KEY);
    if (!validToken) {
      return next(new AuthorizationError("Error verifying access token"));
    }

    req.user = {
      email: validToken.email,
      name: validToken.name,
      id: validToken.id,
    };
    next();
  } catch (error) {
    return next(new AuthorizationError("Error verifying access token"));
  }
};

module.exports = { userValidateToken };
