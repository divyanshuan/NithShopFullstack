const express = require("express");
const multer = require("multer");
const router = express.Router();
const fileController = require("../controllers/fileController");
const { verifyToken } = require("../middleware/auth");

// Configure multer for file uploads
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

// File upload routes
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  fileController.uploadFile
);

// Get files for a property
router.get(
  "/property/:propertyId",
  verifyToken,
  fileController.getPropertyFiles
);

// Get occupant's files
router.get(
  "/occupant/:occupantId",
  verifyToken,
  fileController.getOccupantFiles
);

// Delete file
router.delete("/:fileId", verifyToken, fileController.deleteFile);

// Download file
router.get("/download/:fileId", verifyToken, fileController.downloadFile);

module.exports = router;
