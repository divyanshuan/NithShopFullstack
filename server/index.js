const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { testConnection, initDatabase } = require("./models");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const occupantRoutes = require("./routes/occupant");
const fileRoutes = require("./routes/files");
const communicationRoutes = require("./routes/communications");

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// Rate limiting - Disabled for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static files for uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/occupant", occupantRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/communications", communicationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "NithShop Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize server with database
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize database tables
    await initDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`
      );
      console.log("✅ Database initialized successfully");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
