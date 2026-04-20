import mongoose from "mongoose";
import { PASS_STATUS } from "../config/constants.js";

const passSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true
    },
    passCode: {
      type: String,
      required: true,
      unique: true
    },
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    validFrom: {
      type: Date,
      required: true
    },
    validUntil: {
      type: Date,
      required: true
    },
    qrPayload: {
      type: String,
      required: true
    },
    qrImage: String,
    badgePdfBase64: String,
    status: {
      type: String,
      enum: Object.values(PASS_STATUS),
      default: PASS_STATUS.ACTIVE
    }
  },
  { timestamps: true }
);

export const Pass = mongoose.model("Pass", passSchema);
