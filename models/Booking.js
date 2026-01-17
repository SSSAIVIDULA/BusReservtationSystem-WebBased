const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userPhone: String,
  busId: mongoose.Schema.Types.ObjectId,
  seatNumber: Number,
  name: String,
  age: Number,
  gender: String,
  qrCode: String,
});

module.exports = mongoose.model("Booking", bookingSchema);
