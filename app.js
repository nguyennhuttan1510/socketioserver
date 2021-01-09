const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("trangchu");
});

module.exports = app;
