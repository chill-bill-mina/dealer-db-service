const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return res.status(401).send("Access denied");

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).send("Access denied");
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};
