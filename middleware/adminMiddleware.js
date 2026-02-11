const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
      };

      next();
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(401).json({ message: "Not authorized, token invalid or expired" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access only" });
  next();
};

module.exports = { protect, adminOnly };
