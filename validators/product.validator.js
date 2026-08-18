const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const optionSchema = Joi.object({
  name: Joi.string().required(),
  required: Joi.boolean(),
  price: Joi.number().min(0),
});

const optionGroupSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  options: Joi.array().items(optionSchema),
});

const productSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  business: objectId.required(),
  category: objectId.required(),
  image: Joi.string().uri().allow(null, ""),
  description: Joi.string().max(500).allow(""),
  price: Joi.number().min(0).required(),
  optionGroups: Joi.array().items(optionGroupSchema),
  isPopular: Joi.boolean(),
  isActive: Joi.boolean(),
});

// בעדכון מוצר אפשר לשלוח רק את השדות שרוצים לשנות
const productUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(80),
  business: objectId,
  category: objectId,
  image: Joi.string().uri().allow(null, ""),
  description: Joi.string().max(500).allow(""),
  price: Joi.number().min(0),
  optionGroups: Joi.array().items(optionGroupSchema),
  isPopular: Joi.boolean(),
  isActive: Joi.boolean(),
});

const validateProduct = (data) => {
  const { error } = productSchema.validate(data);

  return error ? error.details[0].message : null;
};

const validateProductUpdate = (data) => {
  const { error } = productUpdateSchema.validate(data);

  return error ? error.details[0].message : null;
};

module.exports = {
  validateProduct,
  validateProductUpdate,
};
