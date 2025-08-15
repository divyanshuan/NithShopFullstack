const express = require("express");
const { verifyOccupant } = require("../middleware/auth");
const OccupantController = require("../controllers/occupantController");

const router = express.Router();

// Apply occupant middleware to all routes
router.use(verifyOccupant);

// Get Occupant Dashboard
router.get("/dashboard", OccupantController.getDashboard);

// Get Property Information
router.get("/property", OccupantController.getPropertyInfo);

module.exports = router;
