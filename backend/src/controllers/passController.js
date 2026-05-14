import { nanoid } from "nanoid";
import { Appointment } from "../models/Appointment.js";
import { Pass } from "../models/Pass.js";
import { CheckLog } from "../models/CheckLog.js";
import { APPOINTMENT_STATUS, CHECK_ACTION, PASS_STATUS } from "../config/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildBadgePdfBuffer, buildQrDataUrl } from "../utils/passArtifacts.js";

export const listPasses = asyncHandler(async (req, res) => {
  const { status = "", hostId = "", q = "" } = req.query;
  const query = { organizationId: req.user.organizationId };

  if (status) {
    query.status = status;
  }

  if (hostId) {
    query.hostId = hostId;
  }

  const passes = await Pass.find(query)
    .populate("visitorId", "fullName email company phone")
    .populate("hostId", "name email")
    .populate("appointmentId", "visitDate purpose status")
    .sort({ createdAt: -1 });

  const filteredPasses = passes.filter((item) => {
    if (!q) {
      return true;
    }

    const search = q.toLowerCase();
    return (
      item.passCode?.toLowerCase().includes(search) ||
      item.visitorId?.fullName?.toLowerCase().includes(search) ||
      item.visitorId?.company?.toLowerCase().includes(search)
    );
  });

  res.json(filteredPasses);
});

export const issuePass = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;

  // A pass should only be issued for an appointment from the logged-in user's organization.
  const appointment = await Appointment.findOne({
    _id: appointmentId,
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

  const existingPass = await Pass.findOne({
    appointmentId: appointment._id,
    organizationId: req.user.organizationId
  });

  if (existingPass) {
    res.status(400);
    throw new Error("A pass has already been issued for this appointment");
  }

  // The pass code is the short value security staff can type manually.
  const passCode = `VP-${nanoid(8).toUpperCase()}`;

  // This is the text stored inside the QR code.
  // I include only the values needed to look up or recognize the pass.
  const qrPayload = {
    passCode,
    appointmentId: String(appointment._id),
    visitorName: appointment.visitorId.fullName
  };
  const qrImage = await buildQrDataUrl(qrPayload);

  // The PDF badge is saved as base64 so the frontend can download it later.
  const badgePdf = await buildBadgePdfBuffer({
    passCode,
    visitorName: appointment.visitorId.fullName,
    hostName: appointment.hostId.name,
    visitDate: appointment.visitDate,
    qrImage
  });

  const pass = await Pass.create({
    organizationId: req.user.organizationId,
    passCode,
    visitorId: appointment.visitorId._id,
    appointmentId: appointment._id,
    hostId: appointment.hostId._id,
    validFrom: appointment.visitDate,
    validUntil: new Date(new Date(appointment.visitDate).getTime() + 8 * 60 * 60 * 1000),
    qrPayload: JSON.stringify(qrPayload),
    qrImage,
    badgePdfBase64: badgePdf.toString("base64")
  });

  res.status(201).json(pass);
});

export const verifyPass = asyncHandler(async (req, res) => {
  // Security enters or scans a pass code, then this API returns the matching pass.
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

  // If the pass time is over, I mark it expired before sending it back.
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

  if (pass.status === PASS_STATUS.EXPIRED || pass.status === PASS_STATUS.CANCELLED) {
    res.status(400);
    throw new Error("This pass is no longer active");
  }

  if (action === CHECK_ACTION.OUT && pass.status !== PASS_STATUS.CHECKED_IN) {
    res.status(400);
    throw new Error("You can only check out a visitor after check-in");
  }

  if (action === CHECK_ACTION.IN) {
    pass.status = PASS_STATUS.CHECKED_IN;
  } else if (action === CHECK_ACTION.OUT) {
    pass.status = PASS_STATUS.CHECKED_OUT;
  } else {
    res.status(400);
    throw new Error("Unknown scan action");
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
  // Exporting logs lets the admin submit or download a simple attendance record.
  const logs = await CheckLog.find({ organizationId: req.user.organizationId })
    .populate("visitorId", "fullName")
    .populate("scannedBy", "name")
    .populate("passId", "passCode")
    .sort({ occurredAt: -1 });

  // I build the CSV row by row so each column is visible in the code.
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
