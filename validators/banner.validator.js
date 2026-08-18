const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const bannerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  description: Joi.string().max(300).allow(""),
  image: Joi.string().uri().allow(null, ""),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  isActive: Joi.boolean(),
  link: Joi.object({
    business: objectId.allow(null),
    category: objectId.allow(null),
  }),
});

const bannerUpdateSchema = bannerSchema.fork(
  ["name", "startDate", "endDate"],
  (schema) => schema.optional(),
);

const validateBanner = (data) => {
  const { error } = bannerSchema.validate(data);

  return error ? error.details[0].message : null;
};

const validateBannerUpdate = (data) => {
  const { error } = bannerUpdateSchema.validate(data);

  return error ? error.details[0].message : null;
};

module.exports = {
  validateBanner,
  validateBannerUpdate,
};
