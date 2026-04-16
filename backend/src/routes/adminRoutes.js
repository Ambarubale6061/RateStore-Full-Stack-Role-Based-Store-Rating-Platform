const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { verifyToken, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { upload, handleUploadError } = require("../middlewares/upload");
const {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  getAllStores,
  createStore,
  updateStoreImage,
  deleteStoreImage,
} = require("../controllers/adminController");

// ------------------- ADMIN LOGIN (unprotected) -------------------
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email required.")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  adminLogin,
);

// ------------------- ALL OTHER ROUTES ARE PROTECTED -------------------
router.use(verifyToken, requireRole("ADMIN"));

// stats
router.get("/stats", getDashboardStats);

// users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post(
  "/users",
  [
    body("name")
      .trim()
      .isLength({ min: 20, max: 60 })
      .withMessage("Name must be 20-60 characters."),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8, max: 16 })
      .matches(/[A-Z]/)
      .matches(/[^a-zA-Z0-9]/)
      .withMessage(
        "Password must be 8-16 chars with uppercase and special character.",
      ),
    body("role").optional().isIn(["ADMIN", "USER", "STORE_OWNER"]),
    body("address").optional().isLength({ max: 400 }),
  ],
  validate,
  createUser,
);

// stores
router.get("/stores", getAllStores);

router.post(
  "/stores",
  upload.single("image"),
  handleUploadError,
  [
    body("name").trim().notEmpty().withMessage("Store name is required."),
    body("email").optional().isEmail().normalizeEmail(),
    body("address").optional().isLength({ max: 400 }),
    body("owner_id").optional().isUUID(),
  ],
  validate,
  createStore,
);

router.put(
  "/stores/:id/image",
  upload.single("image"),
  handleUploadError,
  updateStoreImage,
);

router.delete("/stores/:id/image", deleteStoreImage);

module.exports = router;
