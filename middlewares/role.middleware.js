const AppError = require("../utils/AppError");
const Business = require("../models/business.model");
const Product = require("../models/product.model");

const checkRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }

    next();
  };

// בודק שבעל העסק שמעדכן/מוחק הוא באמת הבעלים של העסק - חוץ מ-admin שיכול הכל
const checkBusinessOwner = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return next();
    }

    if (req.user.role !== "business") {
      return next(new AppError("Access denied", 403));
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return next(new AppError("Business not found", 404));
    }

    if (!business.owner.equals(req.user.userId)) {
      return next(new AppError("You do not own this business", 403));
    }

    req.business = business;
    next();
  } catch (error) {
    next(error);
  }
};

// אותו רעיון, אבל בודקים בעלות על מוצר דרך העסק שהוא שייך אליו
const checkProductOwner = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return next();
    }

    if (req.user.role !== "business") {
      return next(new AppError("Access denied", 403));
    }

    const product = await Product.findById(req.params.id).populate(
      "business",
    );

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    if (!product.business.owner.equals(req.user.userId)) {
      return next(new AppError("You do not own this product", 403));
    }

    req.product = product;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkRole, checkBusinessOwner, checkProductOwner };
