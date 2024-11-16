const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");

// middlewares
const config = require("./config");

const food = require("./routes/foodRoutes");
const user = require("./routes/userRoutes");
const order = require("./routes/orderRoutes");
const notification = require("./routes/notificationRoutes");
const app = express();

const options = {
  origin: "*",
  credentials: true,
};

app.use(cors(options));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

app.use(config.routePrefix + "/user", user);
app.use(config.routePrefix + "/food", food);
app.use(config.routePrefix + "/order", order);
app.use(config.routePrefix + "/notifications", notification);
app.use("*", (req, res) => {
  res.status(200).end("Api is available.");
});

module.exports = app;
