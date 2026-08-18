const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  image: Joi.string().uri().allow(null, ""),
  bizPopular: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
  parentCategory: objectId.allow(null),
  isActive: Joi.boolean(),
});

// בעדכון כל השדות אופציונליים - לא חייבים לשלוח את כל הקטגוריה מחדש
const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  image: Joi.string().uri().allow(null, ""),
  bizPopular: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
  parentCategory: objectId.allow(null),
  isActive: Joi.boolean(),
});

const validateCategory = (categoryData) => {
  const { error } = categorySchema.validate(categoryData);

  return error ? error.details[0].message : null;
};

const validateCategoryUpdate = (categoryData) => {
  const { error } = categoryUpdateSchema.validate(categoryData);

  return error ? error.details[0].message : null;
};

module.exports = {
  validateCategory,
  validateCategoryUpdate,
};
