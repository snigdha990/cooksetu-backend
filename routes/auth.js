const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password, role, phoneNum } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNum }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone number already registered" });
    }

    const newUser = new User({ name, email, password, role, phoneNum });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pw, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const { password: pw, ...userWithoutPassword } = user.toObject();

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
