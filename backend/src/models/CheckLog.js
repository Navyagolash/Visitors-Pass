import mongoose from "mongoose";
import { CHECK_ACTION } from "../config/constants.js";

const checkLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true
    },
    passId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pass",
      required: true
    },
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      enum: Object.values(CHECK_ACTION),
      required: true
    },
    location: String,
    notes: String,
    occurredAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const CheckLog = mongoose.model("CheckLog", checkLogSchema);
