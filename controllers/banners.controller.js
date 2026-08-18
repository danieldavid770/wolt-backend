const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const bannersService = require("../services/banners.service");
const {
  validateBanner,
  validateBannerUpdate,
} = require("../validators/banner.validator");

const getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await bannersService.getActiveBanners();

  res.status(200).json({ success: true, data: banners });
});

const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await bannersService.getAllBanners();

  res.status(200).json({ success: true, data: banners });
});

const createBanner = asyncHandler(async (req, res) => {
  const error = validateBanner(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const banner = await bannersService.createBanner(req.body);

  res.status(201).json({ success: true, data: banner });
});

const updateBanner = asyncHandler(async (req, res) => {
  const error = validateBannerUpdate(req.body);

  if (error) {
    throw new AppError(error, 400);
  }

  const banner = await bannersService.updateBanner(req.params.id, req.body);

  if (!banner) {
    throw new AppError("Banner not found", 404);
  }

  res.status(200).json({ success: true, data: banner });
});

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await bannersService.deleteBanner(req.params.id);

  if (!banner) {
    throw new AppError("Banner not found", 404);
  }

  res.status(200).json({ success: true, message: "Banner deleted" });
});

module.exports = {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
