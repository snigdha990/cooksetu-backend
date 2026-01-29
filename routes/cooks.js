const express = require("express");
const Cook = require("../models/Cook");
const { protect, adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin: list all cooks
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    const cooks = await Cook.find().populate("user", "-password");
    res.json(cooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all approved cooks
router.get("/", async (req, res) => {
  try {
    const cooks = await Cook.find({ status: "approved" }).populate(
      "user",
      "-password"
    );
    res.json(cooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get nearby approved cooks
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const cooks = await Cook.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: "distance",
          maxDistance: 10000, // 10km
          spherical: true,
          query: {
            availability: true,
            status: "approved",
          },
        },
      },
    ]);

    res.json(cooks);
  } catch (err) {
    console.error("Nearby error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Cook registration
router.post("/", protect, async (req, res) => {
  try {
    const existing = await Cook.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: "Cook profile already exists" });

    const cook = await Cook.create({
      user: req.user._id,
      ...req.body,
    });
    res.status(201).json(cook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my cook profile
router.get("/me", protect, async (req, res) => {
  try {
    const cook = await Cook.findOne({ user: req.user._id });
    res.json(cook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update cook status (admin only)
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const cook = await Cook.findById(req.params.id);
    if (!cook) return res.status(404).json({ message: "Cook not found" });

    cook.status = req.body.status;
    await cook.save();
    res.json(cook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
