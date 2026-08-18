require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user.model");
const Category = require("../models/category.model");
const Business = require("../models/business.model");
const Product = require("../models/product.model");
const Address = require("../models/address.model");
const Banner = require("../models/banner.model");
const Order = require("../models/order.model");

const run = async () => {
  await mongoose.connect(process.env.MONGO_CONNECTION);
  console.log("Connected for seeding");

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Business.deleteMany({}),
    Product.deleteMany({}),
    Address.deleteMany({}),
    Banner.deleteMany({}),
    Order.deleteMany({}),
  ]);

  const password = bcrypt.hashSync("123456", 10);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@wolt.test",
    password,
    phone: "0500000001",
    role: "admin",
  });

  const businessOwner = await User.create({
    name: "Business Owner",
    email: "business@wolt.test",
    password,
    phone: "0500000002",
    role: "business",
  });

  const regularUser = await User.create({
    name: "Regular User",
    email: "user@wolt.test",
    password,
    phone: "0500000003",
    role: "user",
  });

  const category = await Category.create({
    name: "אוכל סיני",
    bizPopular: true,
    tags: ["סיני", "אסייתי"],
  });

  const business = await Business.create({
    name: "מסעדת דרקון הזהב",
    description: "אוכל סיני אותנטי",
    isCosher: true,
    label: "פופולרי",
    rating: 8.5,
    category: category._id,
    owner: businessOwner._id,
    workingHours: [
      { day: 0, start: "10:00", end: "23:00" },
      { day: 1, start: "10:00", end: "23:00" },
    ],
    location: { street: "הרצל", houseNumber: "12" },
  });

  const product = await Product.create({
    name: "אורז מטוגן",
    business: business._id,
    category: category._id,
    description: "אורז מטוגן עם ירקות",
    price: 42,
    optionGroups: [
      {
        name: "תוספות",
        description: "עד 2 תוספות",
        options: [
          { name: "חסה", required: false, price: 0 },
          { name: "בצל מטוגן", required: false, price: 3 },
        ],
      },
    ],
    isPopular: true,
  });

  const address = await Address.create({
    user: regularUser._id,
    street: "אלנבי",
    houseNumber: "5",
    placeType: "home",
    isDefault: true,
  });

  await Banner.create({
    name: "מבצע פתיחה",
    description: "10% הנחה על ההזמנה הראשונה",
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    link: { business: business._id, category: category._id },
  });

  console.log("Seed complete:");
  console.log({
    admin: { email: admin.email, password: "123456" },
    business: { email: businessOwner.email, password: "123456" },
    user: { email: regularUser.email, password: "123456" },
    categoryId: category._id.toString(),
    businessId: business._id.toString(),
    productId: product._id.toString(),
    addressId: address._id.toString(),
  });

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
