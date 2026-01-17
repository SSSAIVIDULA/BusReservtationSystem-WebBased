const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const QRCode = require("qrcode");

const User = require("./models/User");
const Bus = require("./models/Bus");
const Booking = require("./models/Booking");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/bus_booking", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Login / Register
app.post("/api/login", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).send("Phone required");

  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone });

  res.json({ phone: user.phone });
});

// ✅ Search Bus
app.post("/api/search", async (req, res) => {
  const { busStand, from, to } = req.body;
  const buses = await Bus.find({ busStand, from, to });
  res.json(buses);
});

// ✅ Get Single Bus & its bookings
app.get("/api/bus/:id", async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  const bookings = await Booking.find({ busId: req.params.id });
  res.json({ bus, bookings });
});

// ✅ Book Seat
app.post("/api/book", async (req, res) => {
  const { phone, busId, seatNumber, name, age, gender } = req.body;
  const user = await User.findOne({ phone });
  if (!user) return res.status(404).send("User not found");

  const bus = await Bus.findById(busId);
  if (!bus) return res.status(404).send("Bus not found");

  const existing = await Booking.findOne({ busId, seatNumber });
  if (existing) return res.status(400).send("Seat already booked");

  const booking = await Booking.create({
    userPhone: phone,
    busId,
    seatNumber,
    name,
    age,
    gender,
  });

  // QR Code
  const qrData = `Bus: ${bus.from} → ${bus.to}, Seat: ${seatNumber}, Passenger: ${name}`;
  const qrCode = await QRCode.toDataURL(qrData);
  booking.qrCode = qrCode;
  await booking.save();

  res.json({ qrCode });
});

// ✅ Start Server
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
