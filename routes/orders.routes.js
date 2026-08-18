const router = require("express").Router();

const {
  createOrder,
  getMyOrders,
  getOrder,
  getBusinessOrders,
  getAllOrders,
  updateOrderStatus,
  rateOrder,
} = require("../controllers/orders.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkRole } = require("../middlewares/role.middleware");

router.post("/create", authMiddleware, createOrder);
router.get("/mine", authMiddleware, getMyOrders);
router.get(
  "/business/mine",
  authMiddleware,
  checkRole("business", "admin"),
  getBusinessOrders,
);
router.get("/all", authMiddleware, checkRole("admin"), getAllOrders);
router.get("/single/:id", authMiddleware, getOrder);
router.patch("/:id/status", authMiddleware, updateOrderStatus);
router.patch("/:id/rating", authMiddleware, rateOrder);

module.exports = router;
