const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const productsService = require("../services/products.service");
const businessesService = require("../services/businesses.service");
const categoriesService = require("../services/categories.service");
const {
  validateProduct,
  validateProductUpdate,
} = require("../validators/product.validator");

const getProducts = asyncHandler(async (req, res) => {
  const products = await productsService.getAllProducts(req.query);

  res.status(200).json({ success: true, data: products });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productsService.getProductById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({ success: true, data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const error = validateProduct(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const business = await businessesService.getBusinessById(req.body.business);

  if (!business) {
    throw new AppError("Business not found", 404);
  }

  if (req.user.role !== "admin" && !business.owner._id.equals(req.user.userId)) {
    throw new AppError("You do not own this business", 403);
  }

  const category = await categoriesService.getCategoryById(req.body.category);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const product = await productsService.createProduct(req.body);

  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const error = validateProductUpdate(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const product = await productsService.updateProduct(
    req.params.id,
    req.body,
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({ success: true, data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productsService.deleteProduct(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({ success: true, message: "Product deleted" });
});

const toggleLike = asyncHandler(async (req, res) => {
  const product = await productsService.toggleLike(
    req.params.id,
    req.user.userId,
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({ success: true, data: product });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleLike,
};
