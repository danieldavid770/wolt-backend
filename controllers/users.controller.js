const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const userService = require("../services/users.service");
const { validateUser, validateUserUpdate, validateCartItem, validateCartUpdate } = require("../validators/user.validator");
const { uploadImageBuffer } = require("../services/upload.service");

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key_here";

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await userService.findByEmail(email);

  if (!user || !user.password) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = bcrypt.compareSync(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    SECRET_KEY,
    {
      expiresIn: "7d",
    },
  );

  res.json({
    success: true,
    token,
    role: user.role,
  });
});

const register = asyncHandler(async (req, res) => {
  const error = validateUser(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const result = await userService.createUser({
    ...req.body,
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result.userCreated,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsersByQuery(req.query);

  res.status(200).json({ success: true, data: users });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({ success: true, data: user });
});

const updateExistingUser = asyncHandler(async (req, res) => {
  const error = validateUserUpdate(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  if (req.user.role !== "admin" && req.user.userId !== req.params.id) {
    throw new AppError("Access denied", 403);
  }

  const user = await userService.updateUser(req.params.id, req.body);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({ success: true, data: user });
});

const removeUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.userId !== req.params.id) {
    throw new AppError("Access denied", 403);
  }

  const user = await userService.deleteUser(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({ success: true, message: "User deleted" });
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Image file is required", 400);
  }

  const uploadedImage = await uploadImageBuffer(req.file.buffer);
  const user = await userService.updateProfileImage(req.user.userId, {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Profile image uploaded successfully",
    data: user,
  });
});

const getCart = asyncHandler(async (req, res) => {
  const cart = await userService.getCart(req.user.userId);

  res.status(200).json({ success: true, data: cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const error = validateCartItem(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const cart = await userService.addToCart(req.user.userId, {
    productId: req.body.productId,
    quantity: req.body.quantity || 1,
    selectedOptions: req.body.selectedOptions || [],
  });

  res.status(200).json({ success: true, data: cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const error = validateCartUpdate(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const cart = await userService.updateCartItemQuantity(
    req.user.userId,
    req.params.itemId,
    req.body.quantity,
  );

  res.status(200).json({ success: true, data: cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await userService.removeCartItem(
    req.user.userId,
    req.params.itemId,
  );

  res.status(200).json({ success: true, data: cart });
});

const clearCart = asyncHandler(async (req, res) => {
  await userService.clearCart(req.user.userId);

  res.status(200).json({ success: true, message: "Cart cleared" });
});

module.exports = {
  login,
  getUsers,
  getUser,
  register,
  updateExistingUser,
  removeUser,
  uploadProfileImage,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
