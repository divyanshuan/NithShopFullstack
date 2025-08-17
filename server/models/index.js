const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "nithshop_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

// Import models - Fix: Call the functions with sequelize instance
const Property = require("./Property")(sequelize);
const Occupant = require("./Occupant")(sequelize);
const AdminUser = require("./AdminUser")(sequelize);
const FileUpload = require("./FileUpload")(sequelize);
const Communication = require("./Communication")(sequelize);

// Define associations
Property.hasMany(Occupant, {
  foreignKey: "property_id",
  as: "occupants",
  onDelete: "CASCADE",
});
Occupant.belongsTo(Property, {
  foreignKey: "property_id",
  as: "property",
});

// File upload associations
Property.hasMany(FileUpload, {
  foreignKey: "property_id",
  as: "fileUploads",
  onDelete: "CASCADE",
});
FileUpload.belongsTo(Property, {
  foreignKey: "property_id",
  as: "property",
});

// Communication associations
Property.hasMany(Communication, {
  foreignKey: "recipient_property_id",
  as: "communications",
  onDelete: "CASCADE",
});
Communication.belongsTo(Property, {
  foreignKey: "recipient_property_id",
  as: "recipientProperty",
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Sync all models with database - use force: false to avoid recreating tables
    await sequelize.sync({ force: false });
    console.log("✅ Database tables synchronized successfully");
    console.log(
      "ℹ️  No default admin user created. Use API endpoint to create admin accounts."
    );
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase,
  Property,
  Occupant,
  AdminUser,
  FileUpload,
  Communication,
};
