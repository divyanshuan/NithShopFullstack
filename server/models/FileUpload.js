const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FileUpload = sequelize.define(
    "FileUpload",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      property_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "properties",
          key: "id",
        },
      },
      uploaded_by: {
        type: DataTypes.ENUM("admin", "occupant"),
        allowNull: false,
      },
      uploaded_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID of admin or occupant who uploaded",
      },
      file_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: "Path to stored PDF file",
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Original filename",
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "File size in bytes",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      tableName: "file_uploads",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return FileUpload;
};
