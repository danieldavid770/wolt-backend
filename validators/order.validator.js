const Joi = require("joi");
const { ORDER_STATUSES } = require("../models/order.model");

const objectId = Joi.string().hex().length(24);

const createOrderSchema = Joi.object({
  addressId: objectId.required(),
  tip: Joi.number().min(0).default(0),
});

const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid(...ORDER_STATUSES)
    .required(),
});

const ratingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
});

const validateCreateOrder = (data) => {
  const { error } = createOrderSchema.validate(data);

  return error ? error.details[0].message : null;
};

const validateStatusUpdate = (data) => {
  const { error } = statusUpdateSchema.validate(data);

  return error ? error.details[0].message : null;
};

const validateRating = (data) => {
  const { error } = ratingSchema.validate(data);

  return error ? error.details[0].message : null;
};

module.exports = {
  validateCreateOrder,
  validateStatusUpdate,
  validateRating,
};
