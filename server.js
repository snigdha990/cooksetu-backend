const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

/**
 * Load .env ONLY for local development
 * Cloud Run provides env vars directly
 */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Routers
const userRouter = require("./routes/users");
const cookRouter = require("./routes/cooks");
const authRouter = require("./routes/auth");
const adminRoutes = require("./routes/admin");

// App
const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/cooks", cookRouter);
app.use("/api/admin", adminRoutes);

app.get("/health", (_req, res) => res.status(200).send("OK"));
app.get("/", (_req, res) => res.send("Backend is running..."));

app.use((err, _req, res, _next) => {
  console.error("Global error:", err);
  res.status(500).json({ message: err.message || "Server error" });
});


const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  console.error(" MONGO_URI is missing");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error(" JWT_SECRET is missing");
  process.exit(1);
}

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

async function start() {
  await connectMongo();

  console.log("ENV VARS:");
  console.log("MONGO_URI:", MONGO_URI.split("?")[0] + "?...");
  console.log("JWT_SECRET:", "[DEFINED]");
  console.log("PORT:", PORT);
  console.log("NODE_ENV:", process.env.NODE_ENV || "development");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();

module.exports = { app };
