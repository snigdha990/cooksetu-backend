const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.id !== user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.id !== user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { password, role, ...rest } = req.body;

    Object.assign(user, rest);

    if (password) {
      user.password = password;
    }

    if (role && req.user.role === "admin") {
      user.role = role;
    }

    await user.save();

    const { password: pw, ...safeUser } = user.toObject();
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.id !== user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/location", protect, async (req, res) => {
  try {
    const { lat, lng, locationString } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({
        message: "Latitude and longitude required",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.location = {
      type: "Point",
      coordinates: [lng, lat], 
    };

    if (locationString) {
      user.locationString = locationString;
    }

    await user.save();

    res.json({
      message: "Location saved successfully",
      location: user.location,
      locationString: user.locationString,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
