const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: String,
  name: String,
  age: Number,
  gender: String,
});

module.exports = mongoose.model("User", userSchema);
