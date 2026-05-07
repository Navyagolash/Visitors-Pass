import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const headerValue = req.headers.authorization || "";
    const parts = headerValue.split(" ");
    const hasBearerToken = parts.length === 2 && parts[0] === "Bearer" && parts[1];

    if (!hasBearerToken) {
      return res.status(401).json({ message: "Please login first" });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "This account no longer exists" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "User session is missing" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You are not allowed to perform this action" });
  }

  return next();
};
