const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const categoriesService = require("../services/categories.service");
const {
  validateCategory,
  validateCategoryUpdate,
} = require("../validators/category.validator");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoriesService.getAllCategories(req.query);

  res.status(200).json({ success: true, data: categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.getCategoryById(req.params.id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({ success: true, data: category });
});

const createCategory = asyncHandler(async (req, res) => {
  const error = validateCategory(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const category = await categoriesService.createCategory(req.body);

  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const error = validateCategoryUpdate(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const category = await categoriesService.updateCategory(
    req.params.id,
    req.body,
  );

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.deleteCategory(req.params.id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({ success: true, message: "Category deleted" });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
