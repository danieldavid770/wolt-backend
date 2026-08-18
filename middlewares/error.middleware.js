const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (error, req, res, next) => {
  if (error.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image must be smaller than 5MB"
          : error.message,
    });
  }

  if (error.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((val) => val.message)
      .join(", ");

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";

    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path}: ${error.value}`,
    });
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  const statusCode = error.statusCode || 500;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

module.exports = { errorHandler, notFound };
