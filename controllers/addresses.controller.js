const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const addressesService = require("../services/addresses.service");
const {
  validateAddress,
  validateAddressUpdate,
} = require("../validators/address.validator");

const getMyAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressesService.getAddressesByUser(
    req.user.userId,
  );

  res.status(200).json({ success: true, data: addresses });
});

const getAddress = asyncHandler(async (req, res) => {
  const address = await addressesService.getAddressById(req.params.id);

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  if (
    req.user.role !== "admin" &&
    !address.user.equals(req.user.userId)
  ) {
    throw new AppError("Access denied", 403);
  }

  res.status(200).json({ success: true, data: address });
});

const createAddress = asyncHandler(async (req, res) => {
  const error = validateAddress(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const address = await addressesService.createAddress({
    ...req.body,
    user: req.user.userId,
  });

  res.status(201).json({ success: true, data: address });
});

const updateAddress = asyncHandler(async (req, res) => {
  const error = validateAddressUpdate(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const existing = await addressesService.getAddressById(req.params.id);

  if (!existing) {
    throw new AppError("Address not found", 404);
  }

  if (
    req.user.role !== "admin" &&
    !existing.user.equals(req.user.userId)
  ) {
    throw new AppError("Access denied", 403);
  }

  const address = await addressesService.updateAddress(
    req.params.id,
    req.body,
  );

  res.status(200).json({ success: true, data: address });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const existing = await addressesService.getAddressById(req.params.id);

  if (!existing) {
    throw new AppError("Address not found", 404);
  }

  if (
    req.user.role !== "admin" &&
    !existing.user.equals(req.user.userId)
  ) {
    throw new AppError("Access denied", 403);
  }

  await addressesService.deleteAddress(req.params.id);

  res.status(200).json({ success: true, message: "Address deleted" });
});

module.exports = {
  getMyAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
};
