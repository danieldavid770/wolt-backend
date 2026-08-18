const mongoose = require("mongoose");

const selectedOptionSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },
    optionName: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  { _id: false },
);

const cartItemSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  selectedOptions: {
    type: [selectedOptionSchema],
    default: [],
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      default: null,
    },
    language: {
      type: String,
      default: "he",
    },
    role: {
      type: String,
      enum: ["user", "admin", "business"],
      default: "user",
    },
    cart: {
      type: [cartItemSchema],
      default: [],
    },
    profileImage: {
      type: String,
      default: null,
    },
    profileImagePublicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
