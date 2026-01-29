const mongoose = require("mongoose");

const CookSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: false }, 
    },

    locationString: { type: String, required: true },

    cuisines: { type: [String], default: [] },
    experience: { type: Number, required: true },
    price: { type: Number, required: true },
    availability: { type: Boolean, default: true },
    phoneNum: { type: String, required: true, unique: true, trim: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

CookSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Cook", CookSchema);
