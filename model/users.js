const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  passwold: String,
});

module.exports = mongoose.model("user", userSchema);
