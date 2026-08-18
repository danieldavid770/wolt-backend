const Product = require("../models/product.model");

const getAllProducts = async (query) => {
  const filter = { isActive: true };

  if (query.business) {
    filter.business = query.business;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.name) {
    filter.name = { $regex: query.name, $options: "i" };
  }

  if (query.isPopular !== undefined) {
    filter.isPopular = query.isPopular === "true";
  }

  return Product.find(filter)
    .populate("business", "name")
    .populate("category", "name")
    .sort({ createdAt: -1 });
};

const getProductById = async (id) => {
  return Product.findById(id)
    .populate("business", "name owner isActive")
    .populate("category", "name");
};

const createProduct = async (productData) => {
  return Product.create(productData);
};

const updateProduct = async (id, productData) => {
  return Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true,
  });
};

const deleteProduct = async (id) => {
  return Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

const toggleLike = async (productId, userId) => {
  const product = await Product.findById(productId);

  if (!product) {
    return null;
  }

  const alreadyLiked = product.likedBy.some((id) => id.equals(userId));

  if (alreadyLiked) {
    product.likedBy.pull(userId);
  } else {
    product.likedBy.push(userId);
  }

  await product.save();

  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleLike,
};
