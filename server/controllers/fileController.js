const { FileUpload, Property, Occupant, AdminUser } = require("../models");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

// Helper function to validate PDF file
const validatePDFFile = (file) => {
  if (!file) {
    return { valid: false, error: "No file uploaded" };
  }

  if (file.mimetype !== "application/pdf") {
    return { valid: false, error: "Only PDF files are allowed" };
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    return { valid: false, error: "File size must be less than 10MB" };
  }

  return { valid: true };
};

// Helper function to save file
const saveFile = async (file) => {
  const fileName = `${uuidv4()}_${file.originalname}`;
  const uploadDir = path.join(__dirname, "../uploads");
  const filePath = path.join(uploadDir, fileName);

  // Ensure upload directory exists
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Save file
  await fs.writeFile(filePath, file.buffer);

  return {
    fileName,
    filePath: `uploads/${fileName}`,
    fileSize: file.size,
  };
};

// Upload file (admin or occupant)
const uploadFile = async (req, res) => {
  try {
    console.log("📁 File upload request received:", {
      body: req.body,
      file: req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : null,
      user: req.user,
    });

    const { propertyId, fileTitle, description } = req.body;
    const { uploadedBy, uploadedById } = req.body; // "admin" or "occupant"

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!propertyId) {
      console.log("❌ No propertyId provided");
      return res.status(400).json({ error: "Property ID is required" });
    }

    if (!uploadedBy) {
      console.log("❌ No uploadedBy provided");
      return res.status(400).json({ error: "Uploader type is required" });
    }

    if (!uploadedById) {
      console.log("❌ No uploadedById provided");
      return res.status(400).json({ error: "Uploader ID is required" });
    }

    // Validate file
    const validation = validatePDFFile(req.file);
    if (!validation.valid) {
      console.log("❌ File validation failed:", validation.error);
      return res.status(400).json({ error: validation.error });
    }

    // Validate property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      console.log("❌ Property not found:", propertyId);
      return res.status(404).json({ error: "Property not found" });
    }

    console.log("✅ Validation passed, saving file...");

    // Save file
    const fileInfo = await saveFile(req.file);

    console.log("✅ File saved, creating database record...");

    // Create file upload record
    const fileUpload = await FileUpload.create({
      property_id: propertyId,
      uploaded_by: uploadedBy,
      uploaded_by_id: uploadedById,
      file_title: fileTitle,
      description: description || null,
      file_path: fileInfo.filePath,
      file_name: fileInfo.fileName,
      file_size: fileInfo.fileSize,
    });

    console.log("✅ File upload record created:", fileUpload.id);

    res.status(201).json({
      message: "File uploaded successfully",
      fileUpload: {
        id: fileUpload.id,
        fileTitle: fileUpload.file_title,
        description: fileUpload.description,
        fileName: fileUpload.file_name,
        fileSize: fileUpload.file_size,
        uploadedBy: fileUpload.uploaded_by,
        uploadedAt: fileUpload.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

// Get files for a property
const getPropertyFiles = async (req, res) => {
  try {
    const { propertyId } = req.params;
    console.log("🔍 Fetching files for property ID:", propertyId);

    const files = await FileUpload.findAll({
      where: {
        property_id: propertyId,
        status: "active",
      },
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["id", "property_code", "property_type"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log("🔍 Found files for property:", files.length);
    files.forEach((file) => {
      console.log("  - File:", {
        id: file.id,
        title: file.file_title,
        uploadedBy: file.uploaded_by,
        uploadedById: file.uploaded_by_id,
        propertyId: file.property_id,
      });
    });

    const formattedFiles = files.map((file) => ({
      id: file.id,
      fileTitle: file.file_title,
      description: file.description,
      fileName: file.file_name,
      fileSize: file.file_size,
      uploadedBy: file.uploaded_by,
      uploadedAt: file.created_at,
      property: file.property,
    }));

    console.log(
      "✅ Returning formatted files for property:",
      formattedFiles.length
    );
    res.json({ files: formattedFiles });
  } catch (error) {
    console.error("❌ Error fetching property files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Get occupant's files
const getOccupantFiles = async (req, res) => {
  try {
    const { occupantId } = req.params;
    console.log("🔍 Fetching files for occupant ID:", occupantId);

    // Get occupant's property
    const occupant = await Occupant.findByPk(occupantId, {
      include: [
        {
          model: Property,
          as: "property",
        },
      ],
    });

    if (!occupant) {
      console.log("❌ Occupant not found");
      return res.status(404).json({ error: "Occupant not found" });
    }

    console.log("✅ Found occupant:", {
      id: occupant.id,
      propertyId: occupant.property_id,
      name: occupant.name,
    });

    const files = await FileUpload.findAll({
      where: {
        property_id: occupant.property_id,
        uploaded_by: "occupant",
        uploaded_by_id: occupantId,
        status: "active",
      },
      order: [["created_at", "DESC"]],
    });

    console.log("🔍 Found files:", files.length);
    files.forEach((file) => {
      console.log("  - File:", {
        id: file.id,
        title: file.file_title,
        uploadedBy: file.uploaded_by,
        uploadedById: file.uploaded_by_id,
        propertyId: file.property_id,
      });
    });

    const formattedFiles = files.map((file) => ({
      id: file.id,
      fileTitle: file.file_title,
      description: file.description,
      fileName: file.file_name,
      fileSize: file.file_size,
      uploadedBy: file.uploaded_by,
      uploadedAt: file.created_at,
    }));

    console.log("✅ Returning formatted files:", formattedFiles.length);
    res.json({ files: formattedFiles });
  } catch (error) {
    console.error("❌ Error fetching occupant files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Delete file (only by uploader or admin)
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { id: userId, role } = req.user; // Get from JWT token

    const file = await FileUpload.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check permissions
    // Admins can delete any file
    // Occupants can only delete their own files
    if (role === "admin") {
      // Admin can delete any file
    } else if (role === "occupant") {
      // Occupant can only delete files they uploaded
      if (file.uploaded_by !== "occupant" || file.uploaded_by_id !== userId) {
        return res.status(403).json({ error: "Permission denied. You can only delete your own files." });
      }
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete physical file
    const filePath = path.join(__dirname, "..", file.file_path);
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.warn("Could not delete physical file:", unlinkError);
    }

    // Delete database record
    await file.destroy();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await FileUpload.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join(__dirname, "..", file.file_path);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: "File not found on disk" });
    }

    res.download(filePath, file.file_name);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
};

module.exports = {
  uploadFile,
  getPropertyFiles,
  getOccupantFiles,
  deleteFile,
  downloadFile,
};
