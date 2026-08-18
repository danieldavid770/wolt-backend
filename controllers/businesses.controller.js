const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const businessesService = require("../services/businesses.service");
const {
  validateBusiness,
  validateBusinessUpdate,
} = require("../validators/business.validator");

const getBusinesses = asyncHandler(async (req, res) => {
  const businesses = await businessesService.getAllBusinesses(req.query);

  res.status(200).json({ success: true, data: businesses });
});

const getBusiness = asyncHandler(async (req, res) => {
  const business = await businessesService.getBusinessById(req.params.id);

  if (!business) {
    throw new AppError("Business not found", 404);
  }

  res.status(200).json({ success: true, data: business });
});

const getMyBusinesses = asyncHandler(async (req, res) => {
  const businesses = await businessesService.getBusinessesByOwner(
    req.user.userId,
  );

  res.status(200).json({ success: true, data: businesses });
});

const createBusiness = asyncHandler(async (req, res) => {
  const error = validateBusiness(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  if (req.user.role === "business") {
    const hasBusiness = await businessesService.ownerHasBusiness(
      req.user.userId,
    );

    if (hasBusiness) {
      throw new AppError(
        "This account already owns a business. Contact an admin to add more.",
        409,
      );
    }
  }

  const business = await businessesService.createBusiness({
    ...req.body,
    owner: req.user.userId,
  });

  res.status(201).json({ success: true, data: business });
});

const updateBusiness = asyncHandler(async (req, res) => {
  const error = validateBusinessUpdate(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const business = await businessesService.updateBusiness(
    req.params.id,
    req.body,
  );

  if (!business) {
    throw new AppError("Business not found", 404);
  }

  res.status(200).json({ success: true, data: business });
});

const deleteBusiness = asyncHandler(async (req, res) => {
  const business = await businessesService.deleteBusiness(req.params.id);

  if (!business) {
    throw new AppError("Business not found", 404);
  }

  res.status(200).json({ success: true, message: "Business deleted" });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const business = await businessesService.toggleFavorite(
    req.params.id,
    req.user.userId,
  );

  if (!business) {
    throw new AppError("Business not found", 404);
  }

  res.status(200).json({ success: true, data: business });
});

module.exports = {
  getBusinesses,
  getBusiness,
  getMyBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  toggleFavorite,
};
