const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWTSECRET;

const authenticateToken = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user; // Add user to the request
    next();
  } catch (error) {
    console.error(error);
    res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;
