const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, phoneNum, lat, lng, locationString } = req.body;

    if (!name || !email || !password || !phoneNum) {
      return res.status(400).json({ message: "Name, email, password, and phone number are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNum }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let location;
    if (lat !== undefined && lng !== undefined) {
      location = { type: "Point", coordinates: [Number(lng), Number(lat)] };
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      phoneNum,
      location,
      locationString: locationString || "",
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pw, ...userWithoutPassword } = newUser.toObject();

    return res.status(201).json({ token, user: userWithoutPassword });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    email = email.trim();
    password = password.trim();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pw, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({ token, user: userWithoutPassword });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
