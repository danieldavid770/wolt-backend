const mongoose = require("mongoose");

const selectedOptionSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },
    optionName: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  { _id: false },
);

const orderLineSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    selectedOptions: { type: [selectedOptionSchema], default: [] },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    products: {
      type: [orderLineSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "An order must contain at least one product",
      },
    },
    businesses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tip: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    takenAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    rating: { type: Number, min: 1, max: 5, default: null },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
