const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Communication = sequelize.define(
    "Communication",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID of admin who sent the communication",
      },
      recipient_type: {
        type: DataTypes.ENUM(
          "individual",
          "all_shops",
          "all_booths",
          "all_canteens",
          "all_properties"
        ),
        allowNull: false,
      },
      recipient_property_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "properties",
          key: "id",
        },
        comment: "Property ID for individual communications, null for bulk",
      },
      file_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Path to stored PDF file (optional)",
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Original filename (optional)",
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "File size in bytes (optional)",
      },
      status: {
        type: DataTypes.ENUM("sent", "delivered", "read"),
        defaultValue: "sent",
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "communications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Communication;
};
