require("dotenv").config();
const jwt=require("jsonwebtoken");
const cookie=require("cookie-parser");
const validateSession = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    req.auth = decoded;
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired, please login again" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};
module.exports={validateSession};