import { nanoid } from "nanoid";
import { Appointment } from "../models/Appointment.js";
import { Pass } from "../models/Pass.js";
import { CheckLog } from "../models/CheckLog.js";
import { APPOINTMENT_STATUS, CHECK_ACTION, PASS_STATUS } from "../config/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildBadgePdfBuffer, buildQrDataUrl } from "../utils/passArtifacts.js";

export const listPasses = asyncHandler(async (req, res) => {
  const passes = await Pass.find({ organizationId: req.user.organizationId })
    .populate("visitorId", "fullName email company phone")
    .populate("hostId", "name email")
    .populate("appointmentId", "visitDate purpose status")
    .sort({ createdAt: -1 });

  res.json(passes);
});

export const issuePass = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({
    _id: req.body.appointmentId,
    organizationId: req.user.organizationId
  })
    .populate("visitorId", "fullName")
    .populate("hostId", "name");

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (appointment.status !== APPOINTMENT_STATUS.APPROVED) {
    res.status(400);
    throw new Error("Only approved appointments can receive passes");
  }

  const passCode = `VP-${nanoid(8).toUpperCase()}`;
  const payload = {
    passCode,
    appointmentId: appointment._id,
    organizationId: appointment.organizationId
  };

  const qrImage = await buildQrDataUrl(payload);
  const badgePdf = await buildBadgePdfBuffer({
    passCode,
    visitorName: appointment.visitorId.fullName,
    hostName: appointment.hostId.name,
    visitDate: appointment.visitDate
  });

  const pass = await Pass.create({
    organizationId: req.user.organizationId,
    passCode,
    visitorId: appointment.visitorId._id,
    appointmentId: appointment._id,
    hostId: appointment.hostId._id,
    validFrom: appointment.visitDate,
    validUntil: new Date(new Date(appointment.visitDate).getTime() + 8 * 60 * 60 * 1000),
    qrPayload: JSON.stringify(payload),
    qrImage,
    badgePdfBase64: badgePdf.toString("base64")
  });

  res.status(201).json(pass);
});

export const verifyPass = asyncHandler(async (req, res) => {
  const pass = await Pass.findOne({
    passCode: req.params.passCode,
    organizationId: req.user.organizationId
  })
    .populate("visitorId", "fullName email phone")
    .populate("hostId", "name")
    .populate("appointmentId", "visitDate purpose");

  if (!pass) {
    res.status(404);
    throw new Error("Pass not found");
  }

  if (new Date() > new Date(pass.validUntil) && pass.status !== PASS_STATUS.CHECKED_OUT) {
    pass.status = PASS_STATUS.EXPIRED;
    await pass.save();
  }

  res.json(pass);
});

export const scanPass = asyncHandler(async (req, res) => {
  const { action, location, notes } = req.body;
  const pass = await Pass.findOne({
    passCode: req.params.passCode,
    organizationId: req.user.organizationId
  });

  if (!pass) {
    res.status(404);
    throw new Error("Pass not found");
  }

  if (action === CHECK_ACTION.IN) {
    pass.status = PASS_STATUS.CHECKED_IN;
  } else if (action === CHECK_ACTION.OUT) {
    pass.status = PASS_STATUS.CHECKED_OUT;
  }

  await pass.save();

  const log = await CheckLog.create({
    organizationId: req.user.organizationId,
    passId: pass._id,
    visitorId: pass.visitorId,
    scannedBy: req.user._id,
    action,
    location,
    notes
  });

  res.json({ pass, log });
});

export const exportLogs = asyncHandler(async (req, res) => {
  const logs = await CheckLog.find({ organizationId: req.user.organizationId })
    .populate("visitorId", "fullName")
    .populate("scannedBy", "name")
    .populate("passId", "passCode")
    .sort({ occurredAt: -1 });

  const rows = [
    ["Pass Code", "Visitor", "Action", "Location", "Scanned By", "Occurred At"].join(","),
    ...logs.map((log) =>
      [
        log.passId?.passCode ?? "",
        log.visitorId?.fullName ?? "",
        log.action,
        log.location ?? "",
        log.scannedBy?.name ?? "",
        new Date(log.occurredAt).toISOString()
      ].join(",")
    )
  ];

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=check-logs.csv");
  res.send(rows.join("\n"));
});
