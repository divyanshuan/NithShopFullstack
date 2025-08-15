const jwt = require("jsonwebtoken");
const { Occupant } = require("../models");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    await verifyToken(req, res, async () => {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      next();
    });
  } catch (error) {
    return res.status(403).json({ error: "Admin access required" });
  }
};

const verifyOccupant = async (req, res, next) => {
  try {
    await verifyToken(req, res, async () => {
      if (req.user.role !== "occupant") {
        return res.status(403).json({ error: "Occupant access required" });
      }
      next();
    });
  } catch (error) {
    return res.status(403).json({ error: "Occupant access required" });
  }
};

const verifyPropertyAccess = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === "admin") {
      return next();
    }

    if (userRole === "occupant") {
      const occupant = await Occupant.findOne({
        where: {
          id: userId,
          property_id: propertyId,
          status: "Active",
        },
      });

      if (!occupant) {
        return res
          .status(403)
          .json({ error: "Access denied to this property" });
      }
      next();
    }
  } catch (error) {
    console.error("Property access verification error:", error);
    return res.status(500).json({ error: "Error verifying property access" });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyOccupant,
  verifyPropertyAccess,
};
