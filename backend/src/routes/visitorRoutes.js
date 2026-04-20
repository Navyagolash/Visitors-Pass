import express from "express";
import { createVisitor, getVisitor, listVisitors } from "../controllers/visitorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.use(protect);
router.get("/", listVisitors);
router.post("/", authorize(ROLES.ADMIN, ROLES.SECURITY, ROLES.EMPLOYEE, ROLES.VISITOR), createVisitor);
router.get("/:id", getVisitor);

export default router;
