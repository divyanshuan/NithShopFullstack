const bcrypt = require("bcryptjs");
const { Property, Occupant } = require("./models");

const createTestOccupant = async () => {
  try {
    console.log("🔍 Creating test occupant...");

    // Find the first property
    const property = await Property.findOne({
      where: { status: "Active" },
    });

    if (!property) {
      console.log("❌ No active properties found");
      return;
    }

    console.log(`✅ Found property: ${property.property_code}`);

    // Check if test occupant already exists
    let testOccupant = await Occupant.findOne({
      where: { email: "test@example.com" },
    });

    if (testOccupant) {
      console.log("✅ Test occupant already exists");
      console.log(`📧 Email: test@example.com`);
      console.log(`🔑 Password: test123`);
      console.log(`🏠 Property: ${property.property_code}`);
      return;
    }

    // Create test occupant
    const hashedPassword = await bcrypt.hash("test123", 12);

    testOccupant = await Occupant.create({
      property_id: property.id,
      name: "Test Occupant",
      email: "test@example.com",
      contact: "1234567890",
      password_hash: hashedPassword,
      is_first_login: false,
      status: "Active",
      start_date: "2024-01-01",
    });

    console.log("✅ Test occupant created successfully!");
    console.log(`📧 Email: test@example.com`);
    console.log(`🔑 Password: test123`);
    console.log(`🏠 Property: ${property.property_code}`);
    console.log(`🆔 Occupant ID: ${testOccupant.id}`);
    console.log(`🏠 Property ID: ${property.id}`);
  } catch (error) {
    console.error("❌ Error creating test occupant:", error);
  }
};

// Run the script
createTestOccupant()
  .then(() => {
    console.log("🏁 Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
