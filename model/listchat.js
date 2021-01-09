const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
  name: String,
  content: String,
});

module.exports = mongoose.model("listchat", itemSchema);
