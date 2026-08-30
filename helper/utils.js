require("dotenv").config();
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ")[1];
  }

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

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Server Error",
  });
};
const resolveUserId = async (req) => {
  if (req.auth?._id) return req.auth._id;
  if (req.auth?.id) return req.auth.id;
  if (req.body?.userId) return req.body.userId;
  if (req.query?.userId) return req.query.userId;
  if (req.params?.userId) return req.params.userId;

  const email = req.body?.useremail || req.body?.email || req.query?.useremail || req.query?.email;
  if (email) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) return user._id;
  }

  return null;
};
module.exports = { validateToken, errorHandler,resolveUserId };