import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];

    // Login creates a JWT. For protected routes I read that token from the header.
    if (!token) {
      return res.status(401).json({ message: "Please login first" });
    }

    // jwt.verify checks the signature and gives me back the user id I stored in it.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    // The token may be valid, but the user might have been deleted later.
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
  // I call protect before this middleware, so req.user should already be set.
  if (!req.user) {
    return res.status(401).json({ message: "User session is missing" });
  }

  // Each route decides which roles are allowed.
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You are not allowed to perform this action" });
  }

  return next();
};
