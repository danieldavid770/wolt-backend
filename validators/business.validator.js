const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const workingHoursSchema = Joi.object({
  day: Joi.number().min(0).max(6).required(),
  start: Joi.string().required(),
  end: Joi.string().required(),
});

const locationSchema = Joi.object({
  street: Joi.string().allow(""),
  houseNumber: Joi.string().allow(""),
  locationCode: Joi.string().length(6).allow(null, ""),
});

const businessSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  description: Joi.string().max(500).allow(""),
  imageLogo: Joi.string().uri().allow(null, ""),
  imageBackup: Joi.string().uri().allow(null, ""),
  isCosher: Joi.boolean(),
  label: Joi.string().allow(""),
  category: objectId.required(),
  workingHours: Joi.array().items(workingHoursSchema),
  location: locationSchema,
  isActive: Joi.boolean(),
});

const businessUpdateSchema = businessSchema.fork(
  ["name", "category"],
  (schema) => schema.optional(),
);

const validateBusiness = (data) => {
  const { error } = businessSchema.validate(data);

  return error ? error.details[0].message : null;
};

const validateBusinessUpdate = (data) => {
  const { error } = businessUpdateSchema.validate(data);

  return error ? error.details[0].message : null;
};

module.exports = {
  validateBusiness,
  validateBusinessUpdate,
};
