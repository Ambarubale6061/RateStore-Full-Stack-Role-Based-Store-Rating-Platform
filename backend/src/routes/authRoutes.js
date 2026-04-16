const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  changePassword,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

router.post(
  "/signup",
  [
    body("name")
      .trim()
      .isLength({ min: 20, max: 60 })
      .withMessage("Name must be 20-60 characters."),
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password must be 8-16 characters.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/[^a-zA-Z0-9]/)
      .withMessage("Password must contain at least one special character."),
    body("address")
      .optional()
      .isLength({ max: 400 })
      .withMessage("Address must be at most 400 characters."),
  ],
  validate,
  signup,
);

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
  login,
);

router.get("/me", verifyToken, getMe);

router.put(
  "/change-password",
  verifyToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password required."),
    body("newPassword")
      .isLength({ min: 8, max: 16 })
      .withMessage("New password must be 8-16 characters.")
      .matches(/[A-Z]/)
      .withMessage("New password must contain at least one uppercase letter.")
      .matches(/[^a-zA-Z0-9]/)
      .withMessage("New password must contain at least one special character."),
  ],
  validate,
  changePassword,
);

module.exports = router;
