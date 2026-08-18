const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key_here";

const authMiddleware = (req, res, next) => {

  const token = req.headers["x-api-key"];

    // console.log("Token:", token);

  if (!token) {
    return res.status(401).json({
      message: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      SECRET_KEY
    );

    // console.log("Decoded token:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
};

const checkManager = (req, res, next) => {
  if (req.user.role !== "manager" && req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
};

module.exports = { checkAdmin, checkManager, authMiddleware };
