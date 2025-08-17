const { Communication, Property, Occupant, AdminUser } = require("../models");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

// Helper function to validate PDF file (optional)
const validatePDFFile = (file) => {
  if (!file) {
    return { valid: true }; // File is optional for communications
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

// Helper function to save file (optional)
const saveFile = async (file) => {
  if (!file) return null;

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

// Send communication to individual property
const sendIndividualCommunication = async (req, res) => {
  try {
    const { propertyId, fileTitle, message } = req.body;
    const { adminId } = req.body;

    // Validate property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    let fileInfo = null;
    if (req.file) {
      // Validate file
      const validation = validatePDFFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Save file
      fileInfo = await saveFile(req.file);
    }

    // Create communication record
    const communication = await Communication.create({
      sender_id: adminId,
      recipient_type: "individual",
      recipient_property_id: propertyId,
      file_title: fileTitle,
      message: message || null,
      file_path: fileInfo ? fileInfo.filePath : null,
      file_name: fileInfo ? fileInfo.fileName : null,
      file_size: fileInfo ? fileInfo.fileSize : null,
    });

    res.status(201).json({
      message: "Communication sent successfully",
      communication: {
        id: communication.id,
        fileTitle: communication.file_title,
        message: communication.message,
        fileName: communication.file_name,
        sentAt: communication.sent_at,
        recipientProperty: property,
      },
    });
  } catch (error) {
    console.error("Error sending individual communication:", error);
    res.status(500).json({ error: "Failed to send communication" });
  }
};

// Send bulk communication
const sendBulkCommunication = async (req, res) => {
  try {
    const { recipientType, fileTitle, message } = req.body;
    const { adminId } = req.body;

    // Validate recipient type
    const validTypes = [
      "all_shops",
      "all_booths",
      "all_canteens",
      "all_properties",
    ];
    if (!validTypes.includes(recipientType)) {
      return res.status(400).json({ error: "Invalid recipient type" });
    }

    let fileInfo = null;
    if (req.file) {
      // Validate file
      const validation = validatePDFFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Save file
      fileInfo = await saveFile(req.file);
    }

    // Get properties based on recipient type
    let whereClause = {};
    if (recipientType === "all_shops") {
      whereClause.property_type = "Shop";
    } else if (recipientType === "all_booths") {
      whereClause.property_type = "Booth";
    } else if (recipientType === "all_canteens") {
      whereClause.property_type = "Canteen";
    }
    // all_properties means all properties regardless of type

    const properties = await Property.findAll({
      where: whereClause,
      attributes: ["id"],
    });

    if (properties.length === 0) {
      return res
        .status(404)
        .json({ error: "No properties found for the specified type" });
    }

    // Create communication records for all properties
    const communications = await Promise.all(
      properties.map((property) =>
        Communication.create({
          sender_id: adminId,
          recipient_type: recipientType,
          recipient_property_id: property.id,
          file_title: fileTitle,
          message: message || null,
          file_path: fileInfo ? fileInfo.filePath : null,
          file_name: fileInfo ? fileInfo.fileName : null,
          file_size: fileInfo ? fileInfo.fileSize : null,
        })
      )
    );

    res.status(201).json({
      message: `Communication sent to ${communications.length} properties successfully`,
      count: communications.length,
      recipientType,
    });
  } catch (error) {
    console.error("Error sending bulk communication:", error);
    res.status(500).json({ error: "Failed to send bulk communication" });
  }
};

// Get communications for a property (admin view)
const getPropertyCommunications = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const communications = await Communication.findAll({
      where: {
        recipient_property_id: propertyId,
        status: "sent",
      },
      include: [
        {
          model: Property,
          as: "recipientProperty",
          attributes: ["id", "property_code", "property_type"],
        },
      ],
      order: [["sent_at", "DESC"]],
    });

    const formattedCommunications = communications.map((comm) => ({
      id: comm.id,
      fileTitle: comm.file_title,
      message: comm.message,
      fileName: comm.file_name,
      fileSize: comm.file_size,
      sentAt: comm.sent_at,
      status: comm.status,
      recipientProperty: comm.recipientProperty,
    }));

    res.json({ communications: formattedCommunications });
  } catch (error) {
    console.error("Error fetching property communications:", error);
    res.status(500).json({ error: "Failed to fetch communications" });
  }
};

// Get communications for occupant
const getOccupantCommunications = async (req, res) => {
  try {
    const { occupantId } = req.params;

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
      return res.status(404).json({ error: "Occupant not found" });
    }

    const communications = await Communication.findAll({
      where: {
        recipient_property_id: occupant.property_id,
        status: "sent",
      },
      order: [["sent_at", "DESC"]],
    });

    const formattedCommunications = communications.map((comm) => ({
      id: comm.id,
      fileTitle: comm.file_title,
      message: comm.message,
      fileName: comm.file_name,
      fileSize: comm.file_size,
      sentAt: comm.sent_at,
      status: comm.status,
    }));

    res.json({ communications: formattedCommunications });
  } catch (error) {
    console.error("Error fetching occupant communications:", error);
    res.status(500).json({ error: "Failed to fetch communications" });
  }
};

// Mark communication as read
const markAsRead = async (req, res) => {
  try {
    const { communicationId } = req.params;

    const communication = await Communication.findByPk(communicationId);
    if (!communication) {
      return res.status(404).json({ error: "Communication not found" });
    }

    communication.status = "read";
    await communication.save();

    res.json({ message: "Communication marked as read" });
  } catch (error) {
    console.error("Error marking communication as read:", error);
    res.status(500).json({ error: "Failed to mark communication as read" });
  }
};

// Delete communication (admin only)
const deleteCommunication = async (req, res) => {
  try {
    const { communicationId } = req.params;
    const { role } = req.user;

    // Only admins can delete communications
    if (role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const communication = await Communication.findByPk(communicationId);
    if (!communication) {
      return res.status(404).json({ error: "Communication not found" });
    }

    // Delete the file if it exists
    if (communication.file_path) {
      try {
        const filePath = path.join(__dirname, "..", communication.file_path);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn("File not found for deletion:", fileError.message);
      }
    }

    await communication.destroy();

    res.json({ message: "Communication deleted successfully" });
  } catch (error) {
    console.error("Error deleting communication:", error);
    res.status(500).json({ error: "Failed to delete communication" });
  }
};

// Download communication file
const downloadCommunication = async (req, res) => {
  try {
    const { communicationId } = req.params;
    const { id: userId, role, propertyId } = req.user;

    // Find the communication
    const communication = await Communication.findByPk(communicationId);
    if (!communication) {
      return res.status(404).json({ error: "Communication not found" });
    }

    // Check if user has access to this communication
    if (role === "occupant") {
      // Occupants can only download communications sent to their property
      if (communication.recipient_property_id !== propertyId) {
        return res.status(403).json({ error: "Access denied" });
      }
    } else if (role === "admin") {
      // Admins can download any communication
      // No additional check needed
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if file exists
    if (!communication.file_path || !communication.file_name) {
      return res.status(404).json({ error: "No file attached to this communication" });
    }

    const filePath = path.join(__dirname, "..", communication.file_path);

    // Check if file exists on disk
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: "File not found" });
    }

    // Set headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${communication.file_name}"`);

    // Stream the file
    const fileStream = require("fs").createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading communication file:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
};

module.exports = {
  sendIndividualCommunication,
  sendBulkCommunication,
  getPropertyCommunications,
  getOccupantCommunications,
  markAsRead,
  deleteCommunication,
  downloadCommunication,
};
