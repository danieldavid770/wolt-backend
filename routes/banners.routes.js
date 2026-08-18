const router = require("express").Router();

const {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/banners.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkRole } = require("../middlewares/role.middleware");

router.get("/list", getActiveBanners);
router.get("/all", authMiddleware, checkRole("admin"), getAllBanners);

router.post("/create", authMiddleware, checkRole("admin"), createBanner);
router.put("/update/:id", authMiddleware, checkRole("admin"), updateBanner);
router.delete(
  "/delete/:id",
  authMiddleware,
  checkRole("admin"),
  deleteBanner,
);

module.exports = router;
