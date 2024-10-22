const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      success: false,
      errors: err.errors,
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
      success: false,
    });
  }

  res.status(500).json({
    message: "Internal server error",
    success: false,
  });
};

module.exports = errorHandler;
