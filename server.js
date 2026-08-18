require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");
const { errorHandler, notFound } = require("./middlewares/error.middleware");

const usersRoutes = require("./routes/users.routes");
const categoriesRoutes = require("./routes/categories.routes");
const businessesRoutes = require("./routes/businesses.routes");
const productsRoutes = require("./routes/products.routes");
const addressesRoutes = require("./routes/addresses.routes");
const bannersRoutes = require("./routes/banners.routes");
const ordersRoutes = require("./routes/orders.routes");

const app = express();

app.use(helmet());
app.use(apiLimiter);
app.use(express.json());
app.use((req, res, next) => {
  if (!req.body) {
    req.body = {};
  }

  next();
});
// app.use(logger);

app.use("/users", usersRoutes);
app.use("/categories", categoriesRoutes);
app.use("/businesses", businessesRoutes);
app.use("/products", productsRoutes);
app.use("/addresses", addressesRoutes);
app.use("/banners", bannersRoutes);
app.use("/orders", ordersRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server Running with MongoDB",
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
};

startServer();
