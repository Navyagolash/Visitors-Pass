import mongoose from "mongoose";
import { APPOINTMENT_STATUS } from "../config/constants.js";

const appointmentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true
    },
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    visitDate: {
      type: Date,
      required: true
    },
    purpose: {
      type: String,
      required: true
    },
    notes: String,
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING
    },
    approvalNote: String
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
