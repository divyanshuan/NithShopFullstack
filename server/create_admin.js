const bcrypt = require("bcryptjs");
const { AdminUser } = require("./models");

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({
      where: { email: "divyanshuvermaji@gmail.com" },
    });

    if (existingAdmin) {
      console.log("❌ Admin with this email already exists!");
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("divyanshuan", saltRounds);

    // Create admin user
    const admin = await AdminUser.create({
      email: "divyanshuvermaji@gmail.com",
      password_hash: hashedPassword,
      name: "Divyanshu Verma",
      role: "Super Admin",
      status: "Active",
    });

    console.log("✅ Admin account created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("👤 Name:", admin.name);
    console.log("🔑 Role:", admin.role);
    console.log("📊 Status:", admin.status);
    console.log("🆔 ID:", admin.id);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    process.exit(0);
  }
};

// Run the script
createAdmin();
