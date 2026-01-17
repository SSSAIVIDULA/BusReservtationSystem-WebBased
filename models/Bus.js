const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busStand: String,  // ✅ Add this field
  from: String,
  to: String,
  departureTime: Date,
  totalSeats: Number,
  bookedSeats: [Number],
  fare: Number,
});

module.exports = mongoose.model("Bus", busSchema);
