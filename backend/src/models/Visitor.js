import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true
    },
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    company: String,
    purpose: String,
    photoUrl: String,
    idProofNumber: String,
    address: String,
    emergencyContact: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export const Visitor = mongoose.model("Visitor", visitorSchema);
