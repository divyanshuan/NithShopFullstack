const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const AdminController = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/auth");
const { validateSystemToken } = require("../middleware/systemToken");

const router = express.Router();

// Apply admin middleware to most routes, but not admin creation
// Admin creation has its own security logic

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



// Create New Admin Account - Protected by system token or existing admin auth
router.post(
  "/admins",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").isLength({ min: 2, max: 100 }),
    body("role").optional().isIn(["Admin", "Super Admin"]),
    body("systemToken").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if this is the first admin creation (requires system token)
    const adminCount = await AdminController.getAdminCount();

    if (adminCount === 0) {
      // First admin creation - require system token
      if (!req.body.systemToken) {
        return res.status(401).json({
          error: "System token required",
          message: "System token is required for initial admin creation",
        });
      }

      // Validate system token
      if (req.body.systemToken !== process.env.SYSTEM_TOKEN) {
        return res.status(403).json({
          error: "Invalid system token",
          message: "Invalid system token provided",
        });
      }
    } else {
      // Subsequent admin creation - require existing admin authentication
      // Use a simple token check instead of the complex middleware
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          error: "Authentication required",
          message: "Authorization token required for creating new admins",
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
          return res.status(403).json({
            error: "Admin access required",
            message: "Only admins can create new admin accounts",
          });
        }
      } catch (error) {
        return res.status(401).json({
          error: "Invalid token",
          message: "Invalid or expired authorization token",
        });
      }
    }

    await AdminController.createAdmin(req, res);
  }
);

// Get All Admin Users
router.get("/admins", verifyAdmin, AdminController.getAllAdmins);

// Change Admin Password
router.put(
  "/admins/:adminId/password",
  verifyAdmin,
  [body("newPassword").isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await AdminController.changeAdminPassword(req, res);
  }
);

// Update Admin Status
router.patch(
  "/admins/:adminId/status",
  verifyAdmin,
  [body("status").isIn(["Active", "Inactive"])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await AdminController.updateAdminStatus(req, res);
  }
);

module.exports = router;
