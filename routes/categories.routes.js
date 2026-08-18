const router = require("express").Router();

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkRole } = require("../middlewares/role.middleware");

router.get("/list", getCategories);
router.get("/single/:id", getCategory);

router.post("/create", authMiddleware, checkRole("admin"), createCategory);
router.put("/update/:id", authMiddleware, checkRole("admin"), updateCategory);
router.delete(
  "/delete/:id",
  authMiddleware,
  checkRole("admin"),
  deleteCategory,
);

module.exports = router;
