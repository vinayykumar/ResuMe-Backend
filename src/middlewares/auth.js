const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ msg: "Access token missing" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ msg: "Invalid or expired token" });

    req.user = user; // attach user payload to request
    next();
  });
}

module.exports = authenticateToken;
