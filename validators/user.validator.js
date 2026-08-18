const Joi = require("joi");

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(6).max(30).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  phone: Joi.string()
    .pattern(/^[0-9]{9,10}$/)
    .required(),
  birthday: Joi.date().allow(null),
  language: Joi.string(),
  role: Joi.string().valid("user", "admin", "business"),
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().pattern(/^[0-9]{9,10}$/),
  birthday: Joi.date().allow(null),
  language: Joi.string(),
});

const cartItemSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).default(1),
  selectedOptions: Joi.array().items(
    Joi.object({
      groupName: Joi.string().required(),
      optionName: Joi.string().required(),
    }),
  ),
});

const cartUpdateSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

const validateUser = (userData) => {
  const { error } = userSchema.validate(userData);

  return error ? error.details[0].message : null;
};

const validateUserUpdate = (userData) => {
  const { error } = userUpdateSchema.validate(userData);

  return error ? error.details[0].message : null;
};

const validateCartItem = (data) => {
  const { error } = cartItemSchema.validate(data);

  return error ? error.details[0].message : null;
};

const validateCartUpdate = (data) => {
  const { error } = cartUpdateSchema.validate(data);

  return error ? error.details[0].message : null;
};

module.exports = {
  validateUser,
  validateUserUpdate,
  validateCartItem,
  validateCartUpdate,
};
