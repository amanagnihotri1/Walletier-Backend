require("dotenv").config();
const jwt=require("jsonwebtoken");
const cookie=require("cookie-parser");
const validateSession = (req, res, next) => {
  console.log(req.cookies);
  const token = req.cookies.token;

  // Check if Authorization header exists and starts with "Bearer"
  if (!token) {
   return res.status(401).json({ error: "No token provided" });
  }
  try {
    // Verify + decode in one step — throws if expired or tampered
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);

    // Attach decoded payload to req for downstream middleware
    req.auth = decoded;
    next();

  } catch (err) {
      return res.status(401).json({ error:err.message });
    }
};
module.exports={validateSession};