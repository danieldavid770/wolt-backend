const router = require("express").Router();

const {
  getUsers,
  getUser,
  updateExistingUser,
  removeUser,
  login,
  register,
  uploadProfileImage,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/users.controller");
const { authMiddleware, checkAdmin } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const {
  loginLimiter,
  uploadLimiter,
} = require("../middlewares/rateLimit.middleware");

// http://localhost:8000/users/login
router.post("/login", loginLimiter, login);

router.post("/register", register);

// http://localhost:8000/users/list?name=avi
router.get("/list", authMiddleware, checkAdmin, getUsers);

router.get("/single/:id", authMiddleware, getUser);

router.put("/update/:id", authMiddleware, updateExistingUser);

router.delete("/delete/:id", authMiddleware, removeUser);

router.patch(
  "/profile-image",
  authMiddleware,
  uploadLimiter,
  upload.single("image"),
  uploadProfileImage,
);

// cart
router.get("/cart", authMiddleware, getCart);
router.post("/cart/add", authMiddleware, addToCart);
router.patch("/cart/item/:itemId", authMiddleware, updateCartItem);
router.delete("/cart/item/:itemId", authMiddleware, removeCartItem);
router.delete("/cart/clear", authMiddleware, clearCart);

module.exports = router;
