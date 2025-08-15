const bcrypt = require("bcryptjs");
const {
  Property,
  Occupant,
  Document,
  Notification,
  AdminUser,
} = require("../models");
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

    // Create property and occupant in a transaction
    const result = await Property.sequelize.transaction(async (t) => {
      // Create property
      const property = await Property.create(
        {
          property_code: propertyCode,
          property_type: propertyType,
        },
        { transaction: t }
      );

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create occupant
      await Occupant.create(
        {
          property_id: property.id,
          name: occupantName,
          email: occupantEmail,
          contact: occupantContact,
          password_hash: hashedPassword,
          start_date: startDate,
        },
        { transaction: t }
      );

      return { property, tempPassword };
    });

    res.status(201).json({
      message: "Property and occupant created successfully",
      property: {
        id: result.property.id,
        propertyCode,
        propertyType,
      },
      occupant: {
        name: occupantName,
        email: occupantEmail,
        tempPassword: result.tempPassword,
      },
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

    const result = await Property.sequelize.transaction(async (t) => {
      // End current occupant's tenure
      await Occupant.update(
        {
          end_date: new Date(),
          status: "Inactive",
        },
        {
          where: {
            property_id: propertyId,
            status: "Active",
          },
          transaction: t,
        }
      );

      // Create new occupant
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      await Occupant.create(
        {
          property_id: propertyId,
          name,
          email,
          contact,
          password_hash: hashedPassword,
          start_date: startDate,
        },
        { transaction: t }
      );

      return { tempPassword };
    });

    res.json({
      message: "Occupant updated successfully",
      newOccupant: {
        name,
        email,
        tempPassword: result.tempPassword,
      },
    });
  } catch (error) {
    console.error("Update occupant error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Regenerate Temporary Password
const regeneratePassword = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const occupant = await Occupant.findOne({
      where: {
        property_id: propertyId,
        status: "Active",
      },
    });

    if (!occupant) {
      return res
        .status(404)
        .json({ error: "No active occupant found for this property" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await Occupant.update(
      {
        password_hash: hashedPassword,
        is_first_login: true,
      },
      { where: { id: occupant.id } }
    );

    res.json({
      message: "Temporary password regenerated successfully",
      tempPassword,
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
          attributes: ["name", "email", "contact", "start_date", "status"],
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const documents = await Document.findAll({
      where: { property_id: propertyId },
      include: [
        {
          model: Occupant,
          as: "occupant",
          attributes: ["name", "start_date", "end_date", "status"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const notifications = await Notification.findAll({
      where: { property_id: propertyId },
      order: [["created_at", "DESC"]],
    });

    res.json({
      property,
      documents,
      notifications,
    });
  } catch (error) {
    console.error("Get property details error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create New Admin Account
const createAdmin = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({
      where: { email },
    });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await AdminUser.create({
      email,
      password_hash: hashedPassword,
      name,
      role: role || "Admin",
      status: "Active",
    });

    res.status(201).json({
      message: "Admin account created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change Admin Password
const changeAdminPassword = async (req, res) => {
  try {
    const { adminId, newPassword } = req.body;

    // Verify admin exists
    const admin = await AdminUser.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await AdminUser.update(
      { password_hash: hashedPassword },
      { where: { id: adminId } }
    );

    res.json({ message: "Admin password changed successfully" });
  } catch (error) {
    console.error("Change admin password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Admin Users
const getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminUser.findAll({
      attributes: ["id", "email", "name", "role", "status", "created_at"],
      order: [["created_at", "DESC"]],
    });

    res.json({ admins });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Admin Status
const updateAdminStatus = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { status } = req.body;

    // Verify admin exists
    const admin = await AdminUser.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Update status
    await AdminUser.update({ status }, { where: { id: adminId } });

    res.json({ message: "Admin status updated successfully" });
  } catch (error) {
    console.error("Update admin status error:", error);
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
