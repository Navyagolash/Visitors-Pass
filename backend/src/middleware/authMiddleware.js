import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // The frontend sends tokens like: Authorization: Bearer token_here
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please login first" });
    }

    // After removing "Bearer ", JWT can check if the token was signed by this app.
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    // A valid token is not enough if the account was deleted.
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
  // protect() should run before authorize(), so req.user should be available here.
  if (!req.user) {
    return res.status(401).json({ message: "User session is missing" });
  }

  // The route passes allowed roles, for example authorize("admin", "security").
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You are not allowed to perform this action" });
  }

  return next();
};
