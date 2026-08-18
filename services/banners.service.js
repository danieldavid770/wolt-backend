const Banner = require("../models/banner.model");

const getActiveBanners = async () => {
  const now = new Date();

  return Banner.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ startDate: 1 });
};

const getAllBanners = async () => {
  return Banner.find().sort({ createdAt: -1 });
};

const getBannerById = async (id) => {
  return Banner.findById(id);
};

const createBanner = async (bannerData) => {
  return Banner.create(bannerData);
};

const updateBanner = async (id, bannerData) => {
  return Banner.findByIdAndUpdate(id, bannerData, {
    new: true,
    runValidators: true,
  });
};

const deleteBanner = async (id) => {
  return Banner.findByIdAndDelete(id);
};

module.exports = {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};
