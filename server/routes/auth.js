const express = require("express");
const { body, validationResult } = require("express-validator");
const AuthController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Admin Login
router.post(
  "/admin/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await AuthController.adminLogin(req, res);
  }
);

// Occupant Login
router.post(
  "/occupant/login",
  [
    body("propertyCode").isLength({ min: 3, max: 10 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await AuthController.occupantLogin(req, res);
  }
);

// Change Password (for first-time login)
router.post(
  "/change-password",
  verifyToken,
  [
    body("newPassword").isLength({ min: 6 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await AuthController.changePassword(req, res);
  }
);

// Verify Token
router.get("/verify", verifyToken, AuthController.verifyToken);

module.exports = router;
