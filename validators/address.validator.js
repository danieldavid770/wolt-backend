const Joi = require("joi");

const addressSchema = Joi.object({
  street: Joi.string().min(2).max(120).required(),
  houseNumber: Joi.string().allow(""),
  buildingNumber: Joi.string().allow(""),
  entrance: Joi.string().allow(""),
  zipCode: Joi.string().allow(""),
  comments: Joi.string().allow(""),
  locationCode: Joi.string().length(6).allow(null, ""),
  placeType: Joi.string().valid("home", "work", "other"),
  isDefault: Joi.boolean(),
});

const addressUpdateSchema = addressSchema.fork(["street"], (schema) =>
  schema.optional(),
);

const validateAddress = (data) => {
  const { error } = addressSchema.validate(data);

  return error ? error.details[0].message : null;
};

const validateAddressUpdate = (data) => {
  const { error } = addressUpdateSchema.validate(data);

  return error ? error.details[0].message : null;
};

module.exports = {
  validateAddress,
  validateAddressUpdate,
};
