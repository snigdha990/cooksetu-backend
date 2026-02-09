const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
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
      return res.status(401).json({
        message: "Not authorized, token invalid or expired",
      });
    }
  } else {
    return res.status(401).json({
      message: "Not authorized, no token provided",
    });
  }
};

module.exports = { protect };
