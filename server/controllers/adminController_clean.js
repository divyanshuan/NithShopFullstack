const bcrypt = require("bcryptjs");
const { Property, Occupant, Document, Notification } = require("../models");
const { Op } = require("sequelize");

// Get Dashboard Overview
const getDashboard = async (req, res) => {
  try {
    const propertyCounts = await Property.findAll({
      attributes: [
        "property_type",
        [Property.sequelize.fn("COUNT", Property.sequelize.col("id")), "count"],
        [
          Property.sequelize.fn(
            "SUM",
            Property.sequelize.literal(
              "CASE WHEN status = 'Active' THEN 1 ELSE 0 END"
            )
          ),
          "active_count",
        ],
      ],
      group: ["property_type"],
    });

    const totalOccupants = await Occupant.count({
      where: { status: "Active" },
    });

    const recentNotifications = await Notification.count({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    res.json({
      propertyCounts,
      totalOccupants,
      recentNotifications,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Properties by Type
const getPropertiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: properties } = await Property.findAndCountAll({
      where: {
        property_type: type,
        status: "Active",
      },
      include: [
        {
          model: Occupant,
          as: "occupants",
          where: { status: "Active" },
          required: false,
          attributes: ["name", "email", "contact", "start_date"],
        },
      ],
      order: [["property_code", "ASC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get properties error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add New Property
const addProperty = async (req, res) => {
  try {
    const {
      propertyType,
      propertyCode,
      occupantName,
      occupantEmail,
      occupantContact,
      startDate,
    } = req.body;

    // Check if property code already exists
    const existingProperty = await Property.findOne({
      where: { property_code: propertyCode },
    });

    if (existingProperty) {
      return res.status(400).json({ error: "Property code already exists" });
    }

    // Create property
    const property = await Property.create({
      property_type: propertyType,
      property_code: propertyCode,
      status: "Active",
    });

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Hash temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create occupant
    const occupant = await Occupant.create({
      name: occupantName,
      email: occupantEmail,
      contact: occupantContact,
      password_hash: hashedPassword,
      property_id: property.id,
      start_date: startDate,
      status: "Active",
      is_first_login: true,
    });

    res.status(201).json({
      message: "Property and occupant created successfully",
      property: {
        id: property.id,
        property_code: property.property_code,
        property_type: property.property_type,
      },
      occupant: {
        id: occupant.id,
        name: occupant.name,
        email: occupant.email,
      },
      tempPassword,
    });
  } catch (error) {
    console.error("Add property error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Occupant Details
const updateOccupant = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { name, email, contact, startDate, endDate } = req.body;

    // Find property and occupant
    const property = await Property.findByPk(propertyId, {
      include: [
        {
          model: Occupant,
          as: "occupants",
          where: { status: "Active" },
          required: false,
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (property.occupants && property.occupants.length > 0) {
      const occupant = property.occupants[0];
      await occupant.update({
        name,
        email,
        contact,
        start_date: startDate,
        end_date: endDate,
      });
    }

    res.json({ message: "Occupant details updated successfully" });
  } catch (error) {
    console.error("Update occupant error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Regenerate Temporary Password
const regeneratePassword = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Find property and occupant
    const property = await Property.findByPk(propertyId, {
      include: [
        {
          model: Occupant,
          as: "occupants",
          where: { status: "Active" },
          required: false,
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (!property.occupants || property.occupants.length === 0) {
      return res.status(404).json({ error: "No active occupant found" });
    }

    const occupant = property.occupants[0];

    // Generate new temporary password
    const newTempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newTempPassword, 12);

    // Update password and reset first login flag
    await occupant.update({
      password_hash: hashedPassword,
      is_first_login: true,
    });

    res.json({
      message: "Temporary password regenerated successfully",
      tempPassword: newTempPassword,
    });
  } catch (error) {
    console.error("Regenerate password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Property Details
const getPropertyDetails = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findByPk(propertyId, {
      include: [
        {
          model: Occupant,
          as: "occupants",
          where: { status: "Active" },
          required: false,
          attributes: [
            "id",
            "name",
            "email",
            "contact",
            "start_date",
            "end_date",
            "is_first_login",
          ],
        },
        {
          model: Document,
          as: "documents",
          attributes: ["id", "document_type", "file_name", "created_at"],
          order: [["created_at", "DESC"]],
          limit: 5,
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({ property });
  } catch (error) {
    console.error("Get property details error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDashboard,
  getPropertiesByType,
  addProperty,
  updateOccupant,
  regeneratePassword,
  getPropertyDetails,
};
