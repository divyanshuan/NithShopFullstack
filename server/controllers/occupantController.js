const { Property, Occupant, FileUpload, Communication } = require("../models");

// Get Dashboard
const getDashboard = async (req, res) => {
  try {
    const propertyId = req.user.propertyId;

    // Get property info
    const property = await Property.findByPk(propertyId, {
      attributes: ["property_code", "property_type", "status"],
    });

    // Get file count for this occupant
    const fileCount = await FileUpload.count({
      where: {
        property_id: propertyId,
        uploaded_by: "occupant",
        uploaded_by_id: req.user.id,
      },
    });

    // Get communication count for this property
    const communicationCount = await Communication.count({
      where: {
        recipient_property_id: propertyId,
      },
    });

    res.json({
      property,
      fileCount,
      communicationCount,
      documents: [],
      notifications: [],
      receiptCount: 0,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Property Info
const getPropertyInfo = async (req, res) => {
  try {
    const propertyId = req.user.propertyId;

    const property = await Property.findByPk(propertyId, {
      attributes: [
        "id",
        "property_code",
        "property_type",
        "status",
        "created_at",
      ],
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({ property });
  } catch (error) {
    console.error("Get property info error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDashboard,
  getPropertyInfo,
};
