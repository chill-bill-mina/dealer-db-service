const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const logger = require("./utils/winstonLogger");
const morgan = require("morgan");
const morganMiddleware = require("./utils/morganStream");
const config = require("config");
const MONGODB_URI = config.get("database.uri");
const userAuthRoutes = require("./routes/user/auth");
const adminAuthRoutes = require("./routes/admin/auth");
const userPurchaseRoutes = require("./routes/user/purchase");
const adminPurchaseRoutes = require("./routes/admin/purchase");
const userProductRoutes = require("./routes/user/product");
const adminProductRoutes = require("./routes/admin/product");
const app = express();
const schedule = require("./schedule");
app.use(bodyParser.json({ limit: "20mb" }));

//CORS Policy
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(helmet());
app.use(compression());
//healthcheck

app.get("/", (req, res) => {
  return res
    .send(
      `App service running in branch: ${process.env.GIT_BRANCH}. Job is: ${process.env.JOB_NAME}`
    )
    .status(200);
});
app.use(morgan("combined", { morganMiddleware }));

//routes
app.use("/user", userAuthRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/user", userPurchaseRoutes);
app.use("/admin", adminPurchaseRoutes);
app.use("/user", userProductRoutes);
app.use("/admin", adminProductRoutes);

app.use((error, req, res, next) => {
  const cleanedMessage = error.message.replace(/\\x1b\[\d+m/g, "");

  logger.error(cleanedMessage);
  const status = error.statusCode;
  const message = error.message.toString().trim();
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 20000 })
  .then((result) => {
    logger.info("Mongodb Connected");
  })
  .catch((err) => {
    logger.error(err);
  });

const server = app.listen(config.get("server.port"), () => {
  logger.info("Server is running on :" + config.get("server.port"));
});

module.exports = app;
