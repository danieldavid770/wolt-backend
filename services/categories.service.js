const Category = require("../models/category.model");

const getAllCategories = async (query) => {
  const filter = {};

  if (query.name) {
    filter.name = { $regex: query.name, $options: "i" };
  }

  if (query.parentCategory === "null") {
    filter.parentCategory = null;
  } else if (query.parentCategory) {
    filter.parentCategory = query.parentCategory;
  }

  if (query.bizPopular !== undefined) {
    filter.bizPopular = query.bizPopular === "true";
  }

  filter.isActive = true;

  return Category.find(filter).sort({ createdAt: -1 });
};

const getCategoryById = async (id) => {
  return Category.findById(id).populate("subCategories", "name image");
};

const createCategory = async (categoryData) => {
  const category = await Category.create(categoryData);

  if (category.parentCategory) {
    await Category.findByIdAndUpdate(category.parentCategory, {
      $addToSet: { subCategories: category._id },
    });
  }

  return category;
};

const updateCategory = async (id, categoryData) => {
  return Category.findByIdAndUpdate(id, categoryData, {
    new: true,
    runValidators: true,
  });
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);

  if (category && category.parentCategory) {
    await Category.findByIdAndUpdate(category.parentCategory, {
      $pull: { subCategories: category._id },
    });
  }

  return category;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
