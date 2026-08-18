const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
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
    image: {
      type: String,
      default: null,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    link: {
      business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        default: null,
      },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Banner", bannerSchema);
