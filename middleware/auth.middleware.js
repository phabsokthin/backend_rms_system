import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.model.js";
// import blacklist model

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided" });
    }

    // Format: Bearer token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const blacklisted = await Blacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Token invalidated. Please login again." });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Save user info in request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;