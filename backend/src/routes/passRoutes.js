import express from "express";
import { exportLogs, issuePass, listPasses, scanPass, verifyPass } from "../controllers/passController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.use(protect);
router.get("/", listPasses);
router.post("/", authorize(ROLES.ADMIN, ROLES.SECURITY), issuePass);
router.get("/verify/:passCode", verifyPass);
router.post("/scan/:passCode", authorize(ROLES.ADMIN, ROLES.SECURITY), scanPass);
router.get("/logs/export", authorize(ROLES.ADMIN, ROLES.SECURITY), exportLogs);

export default router;
