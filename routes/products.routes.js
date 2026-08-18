const router = require("express").Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleLike,
} = require("../controllers/products.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkRole, checkProductOwner } = require("../middlewares/role.middleware");

router.get("/list", getProducts);
router.get("/single/:id", getProduct);

router.post(
  "/create",
  authMiddleware,
  checkRole("business", "admin"),
  createProduct,
);

router.put(
  "/update/:id",
  authMiddleware,
  checkProductOwner("id"),
  updateProduct,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  checkProductOwner("id"),
  deleteProduct,
);

router.patch("/like/:id", authMiddleware, toggleLike);

module.exports = router;
