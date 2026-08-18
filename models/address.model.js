const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    houseNumber: {
      type: String,
      default: "",
    },
    buildingNumber: {
      type: String,
      default: "",
    },
    entrance: {
      type: String,
      default: "",
    },
    zipCode: {
      type: String,
      default: "",
    },
    comments: {
      type: String,
      default: "",
    },
    locationCode: {
      type: String,
      validate: {
        validator: (value) => !value || value.length === 6,
        message: "locationCode must be exactly 6 characters",
      },
      default: null,
    },
    placeType: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Address", addressSchema);
