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
    logging: console.log,
  }
);

const createTables = async () => {
  try {
    console.log("🚀 Starting database migration...");

    // Create file_uploads table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL,
        uploaded_by ENUM('admin', 'occupant') NOT NULL,
        uploaded_by_id INT NOT NULL,
        file_title VARCHAR(255) NOT NULL,
        description TEXT,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INT NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_property_id (property_id),
        INDEX idx_uploaded_by (uploaded_by, uploaded_by_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ file_uploads table created");

    // Create communications table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS communications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        recipient_type ENUM('individual', 'all_shops', 'all_booths', 'all_canteens', 'all_properties') NOT NULL,
        recipient_property_id INT,
        file_title VARCHAR(255) NOT NULL,
        message TEXT,
        file_path VARCHAR(500),
        file_name VARCHAR(255),
        file_size INT,
        status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sender_id (sender_id),
        INDEX idx_recipient_type (recipient_type),
        INDEX idx_recipient_property_id (recipient_property_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ communications table created");

    console.log("🎉 Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await sequelize.close();
  }
};

createTables();
