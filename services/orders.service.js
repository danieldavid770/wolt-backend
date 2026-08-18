const mongoose = require("mongoose");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const Address = require("../models/address.model");
const Product = require("../models/product.model");
const Business = require("../models/business.model");
const AppError = require("../utils/AppError");

// אילו סטטוסים מותר לעבור אליהם מכל סטטוס - כדי שלא יהיה אפשר "לדלג" שלבים
const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

const buildOrderFromCart = async (userId, { addressId, tip }) => {
  const user = await User.findById(userId);

  if (!user.cart.length) {
    throw new AppError("Your cart is empty", 400);
  }

  const address = await Address.findById(addressId);

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  if (!address.user.equals(userId)) {
    throw new AppError("This address does not belong to you", 403);
  }

  const lines = [];
  const businessSet = new Set();

  for (const cartItem of user.cart) {
    const product = await Product.findById(cartItem.product).populate(
      "business",
    );

    if (!product || !product.isActive) {
      throw new AppError(
        "One of the products in your cart is no longer available",
        400,
      );
    }

    if (!product.business || !product.business.isActive) {
      throw new AppError(
        "One of the businesses in your cart is no longer active",
        400,
      );
    }

    // חשוב: המחיר מחושב כאן מהמוצר שנטען עכשיו מה-DB, לא ממה שנשמר בסל
    // ככה לקוח לא יכול "לזייף" מחיר נמוך יותר על ידי שינוי הבקשה
    const optionsTotal = cartItem.selectedOptions.reduce(
      (sum, opt) => sum + opt.price,
      0,
    );
    const unitPrice = product.price + optionsTotal;
    const lineTotal = unitPrice * cartItem.quantity;

    lines.push({
      product: product._id,
      business: product.business._id,
      name: product.name,
      quantity: cartItem.quantity,
      unitPrice,
      selectedOptions: cartItem.selectedOptions,
      lineTotal,
    });

    businessSet.add(product.business._id.toString());
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const discount = 0;
  const tipAmount = tip || 0;
  const totalPrice = subtotal - discount + tipAmount;

  const order = await Order.create({
    user: userId,
    address: addressId,
    products: lines,
    businesses: [...businessSet].map((id) => new mongoose.Types.ObjectId(id)),
    subtotal,
    discount,
    tip: tipAmount,
    totalPrice,
    status: "pending",
  });

  await Product.updateMany(
    { _id: { $in: lines.map((l) => l.product) } },
    { $addToSet: { purchasedBy: userId } },
  );

  user.cart = [];
  await user.save();

  return getOrderById(order._id);
};

const getOrderById = async (id) => {
  return Order.findById(id)
    .populate("user", "name email phone")
    .populate("address")
    .populate("businesses", "name")
    .populate("products.product", "name image");
};

const getOrdersByUser = async (userId, query = {}) => {
  const filter = { user: userId };

  if (query.status) {
    filter.status = query.status;
  }

  return Order.find(filter)
    .populate("businesses", "name")
    .populate("address")
    .sort({ createdAt: -1 });
};

const getOrdersForBusiness = async (businessId, query = {}) => {
  const filter = { businesses: businessId };

  if (query.status) {
    filter.status = query.status;
  }

  return Order.find(filter)
    .populate("user", "name phone")
    .populate("address")
    .sort({ createdAt: -1 });
};

const getAllOrders = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.from || query.to) {
    filter.createdAt = {};

    if (query.from) {
      filter.createdAt.$gte = new Date(query.from);
    }

    if (query.to) {
      filter.createdAt.$lte = new Date(query.to);
    }
  }

  return Order.find(filter)
    .populate("user", "name email")
    .populate("businesses", "name")
    .sort({ createdAt: -1 });
};

const updateStatus = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const allowedNext = STATUS_TRANSITIONS[order.status] || [];

  if (!allowedNext.includes(newStatus)) {
    throw new AppError(
      `Cannot move order from "${order.status}" to "${newStatus}"`,
      400,
    );
  }

  order.status = newStatus;

  if (!order.takenAt && newStatus !== "pending") {
    order.takenAt = new Date();
  }

  if (newStatus === "delivered") {
    order.finishedAt = new Date();
  }

  await order.save();

  return getOrderById(order._id);
};

const setRating = async (orderId, userId, rating) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (!order.user.equals(userId)) {
    throw new AppError("Access denied", 403);
  }

  if (order.status !== "delivered") {
    throw new AppError("Only delivered orders can be rated", 400);
  }

  order.rating = rating;
  await order.save();

  return getOrderById(order._id);
};

const businessOwnsOrder = async (order, businessOwnerId) => {
  const businesses = await Business.find({
    _id: { $in: order.businesses },
    owner: businessOwnerId,
  });

  return businesses.length > 0;
};

module.exports = {
  buildOrderFromCart,
  getOrderById,
  getOrdersByUser,
  getOrdersForBusiness,
  getAllOrders,
  updateStatus,
  setRating,
  businessOwnsOrder,
};
