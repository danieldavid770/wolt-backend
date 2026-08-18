const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const ordersService = require("../services/orders.service");
const businessesService = require("../services/businesses.service");
const {
  validateCreateOrder,
  validateStatusUpdate,
  validateRating,
} = require("../validators/order.validator");

const createOrder = asyncHandler(async (req, res) => {
  const error = validateCreateOrder(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const order = await ordersService.buildOrderFromCart(req.user.userId, {
    addressId: req.body.addressId,
    tip: req.body.tip,
  });

  res.status(201).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await ordersService.getOrdersByUser(
    req.user.userId,
    req.query,
  );

  res.status(200).json({ success: true, data: orders });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await ordersService.getOrderById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const isOwner = order.user._id.equals(req.user.userId);
  const isAdmin = req.user.role === "admin";
  const isBusinessOwner =
    req.user.role === "business" &&
    (await ordersService.businessOwnsOrder(order, req.user.userId));

  if (!isOwner && !isAdmin && !isBusinessOwner) {
    throw new AppError("Access denied", 403);
  }

  res.status(200).json({ success: true, data: order });
});

const getBusinessOrders = asyncHandler(async (req, res) => {
  const myBusinesses = await businessesService.getBusinessesByOwner(
    req.user.userId,
  );

  if (!myBusinesses.length) {
    return res.status(200).json({ success: true, data: [] });
  }

  const businessIds = myBusinesses.map((b) => b._id);
  const ordersPerBusiness = await Promise.all(
    businessIds.map((id) => ordersService.getOrdersForBusiness(id, req.query)),
  );

  const seen = new Set();
  const orders = [];

  for (const list of ordersPerBusiness) {
    for (const order of list) {
      const key = order._id.toString();

      if (!seen.has(key)) {
        seen.add(key);
        orders.push(order);
      }
    }
  }

  orders.sort((a, b) => b.createdAt - a.createdAt);

  res.status(200).json({ success: true, data: orders });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await ordersService.getAllOrders(req.query);

  res.status(200).json({ success: true, data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const error = validateStatusUpdate(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const order = await ordersService.getOrderById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const isAdmin = req.user.role === "admin";
  const isBusinessOwner =
    req.user.role === "business" &&
    (await ordersService.businessOwnsOrder(order, req.user.userId));

  if (!isAdmin && !isBusinessOwner) {
    throw new AppError("Access denied", 403);
  }

  const updated = await ordersService.updateStatus(
    req.params.id,
    req.body.status,
  );

  res.status(200).json({ success: true, data: updated });
});

const rateOrder = asyncHandler(async (req, res) => {
  const error = validateRating(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const order = await ordersService.setRating(
    req.params.id,
    req.user.userId,
    req.body.rating,
  );

  res.status(200).json({ success: true, data: order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getBusinessOrders,
  getAllOrders,
  updateOrderStatus,
  rateOrder,
};
