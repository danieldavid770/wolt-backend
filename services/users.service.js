const User = require("../models/user.model");
const Product = require("../models/product.model");
const AppError = require("../utils/AppError");

const getAllUsersByQuery = async (query) => {
  const filter = {};

  if (query.name) {
    filter.name = { $regex: query.name, $options: "i" };
  }

  if (query.email) {
    filter.email = { $regex: query.email, $options: "i" };
  }

  if (query.role) {
    filter.role = query.role;
  }

  return User.find(filter).select("-password").sort({ createdAt: -1 });
};

const getUserById = async (id) => {
  return User.findById(id).select("-password");
};

const createUser = async (userData) => {
  const userCreated = await User.create(userData);
  const userObject = userCreated.toObject();
  delete userObject.password;

  return {
    userCreated: userObject,
    message: "User created successfully",
  };
};

const updateUser = async (id, userData) => {
  if (userData.password) {
    delete userData.password;
  }

  return User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  }).select("-password");
};

const deleteUser = async (id) => {
  return User.findByIdAndDelete(id).select("-password");
};

const findByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

const updateProfileImage = async (userId, imageData) => {
  return User.findByIdAndUpdate(
    userId,
    {
      profileImage: imageData.url,
      profileImagePublicId: imageData.publicId,
    },
    { new: true, runValidators: true },
  ).select("-password");
};

const optionsSignature = (selectedOptions = []) =>
  [...selectedOptions]
    .map((opt) => `${opt.groupName}:${opt.optionName}`)
    .sort()
    .join("|");

const buildSelectedOptions = (product, requestedOptions = []) => {
  const resolved = [];

  for (const requested of requestedOptions) {
    const group = product.optionGroups.find(
      (g) => g.name === requested.groupName,
    );

    if (!group) {
      throw new AppError(
        `Option group "${requested.groupName}" does not exist on this product`,
        400,
      );
    }

    const option = group.options.find((o) => o.name === requested.optionName);

    if (!option) {
      throw new AppError(
        `Option "${requested.optionName}" does not exist in group "${requested.groupName}"`,
        400,
      );
    }

    resolved.push({
      groupName: group.name,
      optionName: option.name,
      price: option.price,
    });
  }

  const requiredGroups = product.optionGroups.filter(
    (g) => g.options.some((o) => o.required),
  );

  for (const group of requiredGroups) {
    const requiredOptionNames = group.options
      .filter((o) => o.required)
      .map((o) => o.name);
    const hasRequired = resolved.some(
      (r) => r.groupName === group.name && requiredOptionNames.includes(r.optionName),
    );

    if (!hasRequired) {
      throw new AppError(
        `A required option from group "${group.name}" must be selected`,
        400,
      );
    }
  }

  return resolved;
};

const getCart = async (userId) => {
  const user = await User.findById(userId)
    .select("cart")
    .populate("cart.product")
    .populate("cart.business", "name isActive");

  return user.cart;
};

const addToCart = async (userId, { productId, quantity, selectedOptions }) => {
  const product = await Product.findById(productId).populate("business");

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }

  if (!product.business.isActive) {
    throw new AppError("Business is not currently active", 400);
  }

  const user = await User.findById(userId);

  const conflictingBusiness = user.cart.find(
    (item) => !item.business.equals(product.business._id),
  );

  if (conflictingBusiness) {
    throw new AppError(
      "Your cart already contains items from another business. Clear the cart before adding items from a different business.",
      409,
    );
  }

  const resolvedOptions = buildSelectedOptions(product, selectedOptions);
  const signature = optionsSignature(resolvedOptions);

  const existingItem = user.cart.find(
    (item) =>
      item.product.equals(product._id) &&
      optionsSignature(item.selectedOptions) === signature,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    user.cart.push({
      product: product._id,
      business: product.business._id,
      quantity,
      selectedOptions: resolvedOptions,
    });
  }

  await user.save();

  return getCart(userId);
};

const updateCartItemQuantity = async (userId, itemId, quantity) => {
  const user = await User.findById(userId);
  const item = user.cart.id(itemId);

  if (!item) {
    throw new AppError("Cart item not found", 404);
  }

  item.quantity = quantity;
  await user.save();

  return getCart(userId);
};

const removeCartItem = async (userId, itemId) => {
  const user = await User.findById(userId);
  const item = user.cart.id(itemId);

  if (!item) {
    throw new AppError("Cart item not found", 404);
  }

  item.deleteOne();
  await user.save();

  return getCart(userId);
};

const clearCart = async (userId) => {
  await User.findByIdAndUpdate(userId, { cart: [] });
};

module.exports = {
  getAllUsersByQuery,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findByEmail,
  updateProfileImage,
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
