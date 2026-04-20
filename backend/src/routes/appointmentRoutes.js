import express from "express";
import {
  createAppointment,
  listAppointments,
  statsSummary,
  updateAppointmentStatus
} from "../controllers/appointmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.use(protect);
router.get("/", listAppointments);
router.get("/stats/summary", authorize(ROLES.ADMIN, ROLES.SECURITY), statsSummary);
router.post("/", authorize(ROLES.ADMIN, ROLES.SECURITY, ROLES.EMPLOYEE), createAppointment);
router.patch("/:id/status", authorize(ROLES.ADMIN, ROLES.SECURITY, ROLES.EMPLOYEE), updateAppointmentStatus);

export default router;
