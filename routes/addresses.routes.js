const router = require("express").Router();

const {
  getMyAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/addresses.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/mine", authMiddleware, getMyAddresses);
router.get("/single/:id", authMiddleware, getAddress);
router.post("/create", authMiddleware, createAddress);
router.put("/update/:id", authMiddleware, updateAddress);
router.delete("/delete/:id", authMiddleware, deleteAddress);

module.exports = router;
