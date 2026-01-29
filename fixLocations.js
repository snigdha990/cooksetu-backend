const mongoose = require("mongoose");
const Cook = require("./models/Cook");
require("dotenv").config();

async function fixLocations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const result = await Cook.updateMany(
      { $or: [ { location: { $exists: false } }, { "location.type": { $exists: false } } ] },
      { $set: { location: { type: "Point", coordinates: [78.0, 17.0] } } } 
    );

    console.log(`Updated ${result.modifiedCount} cook(s) with default location`);
    await Cook.collection.createIndex({ location: "2dsphere" });
    console.log("2dsphere index created successfully");

    process.exit(0);
  } catch (err) {
    console.error("Error fixing locations:", err);
    process.exit(1);
  }
}

fixLocations();
