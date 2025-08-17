const express = require("express");
const multer = require("multer");
const router = express.Router();
const communicationController = require("../controllers/communicationController");
const { verifyToken } = require("../middleware/auth");

// Configure multer for file uploads (optional for communications)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Communication routes
router.post(
  "/individual",
  verifyToken,
  upload.single("file"),
  communicationController.sendIndividualCommunication
);
router.post(
  "/bulk",
  verifyToken,
  upload.single("file"),
  communicationController.sendBulkCommunication
);

// Get communications for a property (admin view)
router.get(
  "/property/:propertyId",
  verifyToken,
  communicationController.getPropertyCommunications
);

// Get communications for occupant
router.get(
  "/occupant/:occupantId",
  verifyToken,
  communicationController.getOccupantCommunications
);

// Mark communication as read
router.patch(
  "/:communicationId/read",
  verifyToken,
  communicationController.markAsRead
);

// Delete communication (admin only)
router.delete(
  "/:communicationId",
  verifyToken,
  communicationController.deleteCommunication
);

// Download communication file
router.get(
  "/download/:communicationId",
  verifyToken,
  communicationController.downloadCommunication
);

module.exports = router;
