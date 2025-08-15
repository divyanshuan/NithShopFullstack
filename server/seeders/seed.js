const bcrypt = require("bcryptjs");
const { Property, Occupant, AdminUser, Document, Notification } = require("../models");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if properties already exist
    const existingProperties = await Property.findAll();
    if (existingProperties.length > 0) {
      console.log(`📦 Found ${existingProperties.length} existing properties, skipping creation`);
    } else {
      // Create Properties
      console.log("📦 Creating properties...");
      const properties = await Property.bulkCreate([
        {
          property_code: "SH01",
          property_type: "Shop",
          status: "Active",
        },
        {
          property_code: "SHOP001",
          property_type: "Shop",
          status: "Active",
        },
        {
          property_code: "SHOP002",
          property_type: "Shop",
          status: "Active",
        },
        {
          property_code: "SHOP003",
          property_type: "Shop",
          status: "Active",
        },
        {
          property_code: "SHOP004",
          property_type: "Shop",
          status: "Active",
        },
      ]);

      console.log(`✅ Created ${properties.length} properties`);
    }

    // Create Admin User
    console.log("👨‍💼 Checking admin user...");
    let admin = await AdminUser.findOne({ where: { email: "admin@nithshop.com" } });
    
    if (!admin) {
      console.log("👨‍💼 Creating admin user...");
      const adminPassword = await bcrypt.hash("admin123", 12);
      admin = await AdminUser.create({
        name: "System Administrator",
        email: "admin@nithshop.com",
        password_hash: adminPassword,
        role: "admin",
        status: "Active",
      });
      console.log(`✅ Created admin user: ${admin.email} (password: admin123)`);
    } else {
      console.log(`✅ Admin user already exists: ${admin.email} (password: admin123)`);
    }

    // Get properties for occupant creation
    const properties = await Property.findAll();
    
    // Create Occupants
    console.log("👥 Checking occupants...");
    const existingOccupants = await Occupant.findAll();
    
    if (existingOccupants.length === 0) {
      console.log("👥 Creating occupants...");
      const occupants = await Occupant.bulkCreate([
        {
          property_id: properties[0].id,
          name: "Divyanshu Verma",
          email: "vermadivyanshu000@gmail.com",
          contact: "9876543210",
          password_hash: await bcrypt.hash("nith@123", 12),
          is_first_login: false,
          status: "Active",
          start_date: "2024-01-01",
        },
        {
          property_id: properties[1].id,
          name: "Occupant SHOP001",
          email: "occupant.shop001@example.com",
          contact: "9876543211",
          password_hash: await bcrypt.hash("nith@123", 12),
          is_first_login: false,
          status: "Active",
          start_date: "2024-01-01",
        },
        {
          property_id: properties[2].id,
          name: "Occupant SHOP002",
          email: "occupant.shop002@example.com",
          contact: "9876543212",
          password_hash: await bcrypt.hash("nith@123", 12),
          is_first_login: false,
          status: "Active",
          start_date: "2024-01-01",
        },
        {
          property_id: properties[3].id,
          name: "Occupant SHOP003",
          email: "occupant.shop003@example.com",
          contact: "9876543213",
          password_hash: await bcrypt.hash("nith@123", 12),
          is_first_login: false,
          status: "Active",
          start_date: "2024-01-01",
        },
        {
          property_id: properties[4].id,
          name: "Occupant SHOP004",
          email: "occupant.shop004@example.com",
          contact: "9876543214",
          password_hash: await bcrypt.hash("nith@123", 12),
          is_first_login: false,
          status: "Active",
          start_date: "2024-01-01",
        },
      ]);

      console.log(`✅ Created ${occupants.length} occupants`);
    } else {
      console.log(`✅ Found ${existingOccupants.length} existing occupants`);
    }

    // Get occupants for document creation
    const occupants = await Occupant.findAll();
    
    // Create Sample Documents
    console.log("📄 Checking sample documents...");
    const existingDocuments = await Document.findAll();
    
    if (existingDocuments.length === 0) {
      console.log("📄 Creating sample documents...");
      const documents = await Document.bulkCreate([
        {
          property_id: properties[0].id,
          occupant_id: occupants[0].id,
          document_type: "Agreement",
          file_name: "sample_agreement.pdf",
          file_path: "/uploads/sample_agreement.pdf",
          file_size: 1024000,
          description: "Sample rental agreement document",
        },
        {
          property_id: properties[0].id,
          occupant_id: occupants[0].id,
          document_type: "Allotment Letter",
          file_name: "sample_allotment.pdf",
          file_path: "/uploads/sample_allotment.pdf",
          file_size: 512000,
          description: "Sample allotment letter",
        },
        {
          property_id: properties[0].id,
          occupant_id: occupants[0].id,
          document_type: "Receipt",
          file_name: "rent_receipt_jan.pdf",
          file_path: "/uploads/rent_receipt_jan.pdf",
          file_size: 256000,
          description: "Rent receipt for January 2024",
          month: "January",
          year: 2024,
        },
      ]);

      console.log(`✅ Created ${documents.length} sample documents`);
    } else {
      console.log(`✅ Found ${existingDocuments.length} existing documents`);
    }

    // Create Sample Notifications
    console.log("🔔 Checking sample notifications...");
    const existingNotifications = await Notification.findAll();
    
    if (existingNotifications.length === 0) {
      console.log("🔔 Creating sample notifications...");
      const notifications = await Notification.bulkCreate([
        {
          property_id: properties[0].id,
          title: "Welcome to NithShop",
          message: "Welcome to your new shop! Please ensure all documents are submitted within 7 days.",
          type: "Individual",
          document_type: "General",
          created_by: admin.id,
          occupant_id: occupants[0].id,
          is_read: false,
        },
        {
          property_id: properties[0].id,
          title: "Document Submission Reminder",
          message: "Please submit your rental agreement and allotment letter as soon as possible.",
          type: "Individual",
          document_type: "Document",
          created_by: admin.id,
          occupant_id: occupants[0].id,
          is_read: false,
        },
        {
          property_id: properties[0].id,
          title: "Maintenance Notice",
          message: "Scheduled maintenance will be conducted on Saturday from 9 AM to 12 PM.",
          type: "Broadcast",
          document_type: "Maintenance",
          created_by: admin.id,
          occupant_id: occupants[0].id,
          is_read: false,
        },
      ]);

      console.log(`✅ Created ${notifications.length} sample notifications`);
    } else {
      console.log(`✅ Found ${existingNotifications.length} existing notifications`);
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("👨‍💼 Admin: admin@nithshop.com / admin123");
    console.log("👥 Occupant: vermadivyanshu000@gmail.com / nith@123");
    console.log("🏪 Property Code: SH01");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
