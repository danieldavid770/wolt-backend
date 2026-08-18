const router = require("express").Router();

const {
  getBusinesses,
  getBusiness,
  getMyBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  toggleFavorite,
} = require("../controllers/businesses.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkRole, checkBusinessOwner } = require("../middlewares/role.middleware");

router.get("/list", getBusinesses);
router.get("/single/:id", getBusiness);

router.get(
  "/mine",
  authMiddleware,
  checkRole("business", "admin"),
  getMyBusinesses,
);

router.post(
  "/create",
  authMiddleware,
  checkRole("business", "admin"),
  createBusiness,
);

router.put(
  "/update/:id",
  authMiddleware,
  checkBusinessOwner("id"),
  updateBusiness,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  checkBusinessOwner("id"),
  deleteBusiness,
);

router.patch("/favorite/:id", authMiddleware, toggleFavorite);

module.exports = router;
