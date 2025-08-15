const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AdminUser, Occupant, Property } = require("../models");

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminUser.findOne({
      where: { email, status: "Active" },
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
        name: admin.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Occupant Login
const occupantLogin = async (req, res) => {
  try {
    const { propertyCode, email, password } = req.body;

    // First find the property
    const property = await Property.findOne({
      where: { property_code: propertyCode, status: "Active" },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Then find the occupant for this property
    const occupant = await Occupant.findOne({
      where: {
        email,
        property_id: property.id,
        status: "Active",
      },
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["property_code", "property_type"],
        },
      ],
    });

    if (!occupant) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      occupant.password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: occupant.id,
        email: occupant.email,
        role: "occupant",
        propertyId: occupant.property_id,
        propertyCode: occupant.property.property_code,
        propertyType: occupant.property.property_type,
        name: occupant.name,
        isFirstLogin: occupant.is_first_login,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({
      message: "Occupant login successful",
      token,
      user: {
        id: occupant.id,
        email: occupant.email,
        name: occupant.name,
        propertyId: occupant.property_id,
        propertyCode: occupant.property.property_code,
        propertyType: occupant.property.property_type,
        isFirstLogin: occupant.is_first_login,
      },
    });
  } catch (error) {
    console.error("Occupant login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    if (userRole === "occupant") {
      await Occupant.update(
        {
          password_hash: hashedPassword,
          is_first_login: false,
        },
        { where: { id: userId } }
      );

      // Fetch updated occupant data to generate new token
      const updatedOccupant = await Occupant.findByPk(userId, {
        include: [
          {
            model: require("../models").Property,
            as: "property",
            attributes: ["property_code", "property_type"],
          },
        ],
      });

      // Generate new token with updated isFirstLogin status
      const newToken = jwt.sign(
        {
          id: updatedOccupant.id,
          email: updatedOccupant.email,
          role: "occupant",
          propertyId: updatedOccupant.property_id,
          propertyCode: updatedOccupant.property.property_code,
          propertyType: updatedOccupant.property.property_type,
          name: updatedOccupant.name,
          isFirstLogin: updatedOccupant.is_first_login,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );

      res.json({
        message: "Password changed successfully",
        token: newToken,
        user: {
          id: updatedOccupant.id,
          email: updatedOccupant.email,
          name: updatedOccupant.name,
          role: "occupant",
          propertyId: updatedOccupant.property_id,
          propertyCode: updatedOccupant.property.property_code,
          propertyType: updatedOccupant.property.property_type,
          isFirstLogin: updatedOccupant.is_first_login,
        },
      });
    } else {
      await AdminUser.update(
        { password_hash: hashedPassword },
        { where: { id: userId } }
      );

      res.json({ message: "Password changed successfully" });
    }
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify Token
const verifyToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let userData;

    if (userRole === "occupant") {
      // Fetch fresh occupant data from database
      const occupant = await Occupant.findByPk(userId, {
        include: [
          {
            model: require("../models").Property,
            as: "property",
            attributes: ["property_code", "property_type"],
          },
        ],
      });

      if (!occupant) {
        return res.status(404).json({ error: "User not found" });
      }

      userData = {
        id: occupant.id,
        email: occupant.email,
        name: occupant.name,
        role: "occupant",
        propertyId: occupant.property_id,
        propertyCode: occupant.property?.property_code,
        propertyType: occupant.property?.property_type,
        isFirstLogin: occupant.is_first_login,
      };
    } else if (userRole === "admin") {
      // Fetch fresh admin data from database
      const admin = await require("../models").AdminUser.findByPk(userId);

      if (!admin) {
        return res.status(404).json({ error: "User not found" });
      }

      userData = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };
    } else {
      return res.status(400).json({ error: "Invalid user role" });
    }

    res.json({
      valid: true,
      user: userData,
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  adminLogin,
  occupantLogin,
  changePassword,
  verifyToken,
};
