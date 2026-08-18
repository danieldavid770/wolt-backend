const Address = require("../models/address.model");

const getAddressesByUser = async (userId) => {
  return Address.find({ user: userId }).sort({ createdAt: -1 });
};

const getAddressById = async (id) => {
  return Address.findById(id);
};

const createAddress = async (addressData) => {
  if (addressData.isDefault) {
    await Address.updateMany(
      { user: addressData.user },
      { isDefault: false },
    );
  }

  return Address.create(addressData);
};

const updateAddress = async (id, addressData) => {
  if (addressData.isDefault) {
    const address = await Address.findById(id);

    if (address) {
      await Address.updateMany(
        { user: address.user, _id: { $ne: id } },
        { isDefault: false },
      );
    }
  }

  return Address.findByIdAndUpdate(id, addressData, {
    new: true,
    runValidators: true,
  });
};

const deleteAddress = async (id) => {
  return Address.findByIdAndDelete(id);
};

module.exports = {
  getAddressesByUser,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
