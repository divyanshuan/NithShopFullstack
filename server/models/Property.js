const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Property = sequelize.define(
    "Property",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      property_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      property_type: {
        type: DataTypes.ENUM("Shop", "Booth", "Canteen"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Active", "Inactive"),
        defaultValue: "Active",
      },
    },
    {
      tableName: "properties",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Property;
};
