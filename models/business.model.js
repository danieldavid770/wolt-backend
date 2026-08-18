const mongoose = require("mongoose");

const workingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      min: 0,
      max: 6,
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    imageLogo: {
      type: String,
      default: null,
    },
    imageBackup: {
      type: String,
      default: null,
    },
    isCosher: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workingHours: {
      type: [workingHoursSchema],
      default: [],
    },
    location: {
      street: { type: String, default: "" },
      houseNumber: { type: String, default: "" },
      locationCode: {
        type: String,
        validate: {
          validator: (value) => !value || value.length === 6,
          message: "locationCode must be exactly 6 characters",
        },
        default: null,
      },
    },
    favoritedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Business", businessSchema);
