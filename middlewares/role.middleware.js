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

const checkBusinessOwner = (paramName = "id") => {
  return async (req, res, next) => {
    try {
      if (req.user.role === "admin") {
        return next();
      }

      if (req.user.role !== "business") {
        return next(new AppError("Access denied", 403));
      }

      const businessId = req.params[paramName] || req.body.businessId;
      const business = await Business.findById(businessId);

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
};

const checkProductOwner = (paramName = "id") => {
  return async (req, res, next) => {
    try {
      if (req.user.role === "admin") {
        return next();
      }

      if (req.user.role !== "business") {
        return next(new AppError("Access denied", 403));
      }

      const productId = req.params[paramName];
      const product = await Product.findById(productId).populate("business");

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
};

module.exports = { checkRole, checkBusinessOwner, checkProductOwner };
