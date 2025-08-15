const systemToken = require("crypto").randomBytes(32).toString("hex");

// Middleware to validate system token for initial admin creation
const validateSystemToken = (req, res, next) => {
  const { systemToken: token } = req.body;

  if (!token) {
    return res.status(401).json({
      error: "System token required",
      message: "System token is required for initial admin creation",
    });
  }

  // Check if system token matches
  if (token !== process.env.SYSTEM_TOKEN) {
    return res.status(403).json({
      error: "Invalid system token",
      message: "Invalid system token provided",
    });
  }

  next();
};

// Function to get the system token (for initial setup)
const getSystemToken = () => {
  return systemToken;
};

module.exports = {
  validateSystemToken,
  getSystemToken,
};
