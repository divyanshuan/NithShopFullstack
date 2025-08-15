const express = require("express");
const { body, validationResult } = require("express-validator");
const AdminController = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// Get Dashboard Overview
router.get("/dashboard", verifyAdmin, AdminController.getDashboard);

// Get Properties by Type
router.get(
  "/properties/:type",
  verifyAdmin,
  AdminController.getPropertiesByType
);

// Add New Property
router.post(
  "/properties",
  verifyAdmin,
  [
    body("propertyType").isIn(["Shop", "Booth", "Canteen"]),
    body("propertyCode").isLength({ min: 3, max: 10 }),
    body("occupantName").isLength({ min: 2, max: 100 }),
    body("occupantEmail").isEmail().normalizeEmail(),
    body("occupantContact").optional().isLength({ min: 10, max: 15 }),
    body("startDate").isISO8601().toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await AdminController.addProperty(req, res);
  }
);

// Update Occupant Details
router.put(
  "/properties/:propertyId/occupant",
  verifyAdmin,
  [
    body("name").isLength({ min: 2, max: 100 }),
    body("email").isEmail().normalizeEmail(),
    body("contact").optional().isLength({ min: 10, max: 15 }),
    body("startDate").isISO8601().toDate(),
    body("endDate").optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await AdminController.updateOccupant(req, res);
  }
);

// Regenerate Temporary Password
router.post(
  "/properties/:propertyId/regenerate-password",
  verifyAdmin,
  AdminController.regeneratePassword
);

// Get Property Details
router.get(
  "/properties/:propertyId",
  verifyAdmin,
  AdminController.getPropertyDetails
);

module.exports = router;
