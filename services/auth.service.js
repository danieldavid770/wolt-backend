const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key_here";

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = {
  createToken,
};