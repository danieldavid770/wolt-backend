const Business = require("../models/business.model");

const getAllBusinesses = async (query) => {
  const filter = { isActive: true };

  if (query.name) {
    filter.name = { $regex: query.name, $options: "i" };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.isCosher !== undefined) {
    filter.isCosher = query.isCosher === "true";
  }

  return Business.find(filter)
    .populate("category", "name")
    .populate("owner", "name email")
    .sort({ createdAt: -1 });
};

const getBusinessById = async (id) => {
  return Business.findById(id)
    .populate("category", "name")
    .populate("owner", "name email");
};

const getBusinessesByOwner = async (ownerId) => {
  return Business.find({ owner: ownerId }).populate("category", "name");
};

const ownerHasBusiness = async (ownerId) => {
  return Business.exists({ owner: ownerId });
};

const createBusiness = async (businessData) => {
  return Business.create(businessData);
};

const updateBusiness = async (id, businessData) => {
  return Business.findByIdAndUpdate(id, businessData, {
    new: true,
    runValidators: true,
  });
};

const deleteBusiness = async (id) => {
  return Business.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

const toggleFavorite = async (businessId, userId) => {
  const business = await Business.findById(businessId);

  if (!business) {
    return null;
  }

  const alreadyFavorited = business.favoritedBy.some((id) =>
    id.equals(userId),
  );

  if (alreadyFavorited) {
    business.favoritedBy.pull(userId);
  } else {
    business.favoritedBy.push(userId);
  }

  await business.save();

  return business;
};

module.exports = {
  getAllBusinesses,
  getBusinessById,
  getBusinessesByOwner,
  ownerHasBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  toggleFavorite,
};
