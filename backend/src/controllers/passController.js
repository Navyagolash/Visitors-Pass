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

export const issuePass = async (req, res) => {
  try {
    const appointmentId = req.body.appointmentId;

    // First I find the appointment. I also check organizationId so one organization
    // cannot issue a pass for another organization's visitor.
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      organizationId: req.user.organizationId
    })
      .populate("visitorId", "fullName")
      .populate("hostId", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== APPOINTMENT_STATUS.APPROVED) {
      return res.status(400).json({ message: "Only approved appointments can receive passes" });
    }

    const oldPass = await Pass.findOne({
      appointmentId: appointment._id,
      organizationId: req.user.organizationId
    });

    if (oldPass) {
      return res.status(400).json({ message: "A pass has already been issued for this appointment" });
    }

    const passCode = `VP-${nanoid(8).toUpperCase()}`;
    console.log("Issuing pass for appointment", String(appointment._id));

    // This object becomes the QR code text. When scanned, I can read the passCode
    // and search the pass from the database.
    const qrPayload = {
      passCode,
      appointmentId: String(appointment._id),
      visitorName: appointment.visitorId.fullName
    };
    const qrImage = await buildQrDataUrl(qrPayload);

    // PDFKit returns a file buffer. I convert it to base64 before storing
    // because the frontend can easily turn base64 back into a downloadable PDF.
    const badgePdf = await buildBadgePdfBuffer({
      passCode,
      visitorName: appointment.visitorId.fullName,
      hostName: appointment.hostId.name,
      visitDate: appointment.visitDate,
      qrImage
    });

    const validUntil = new Date(appointment.visitDate);
    validUntil.setHours(validUntil.getHours() + 8);

    const pass = await Pass.create({
      organizationId: req.user.organizationId,
      passCode,
      visitorId: appointment.visitorId._id,
      appointmentId: appointment._id,
      hostId: appointment.hostId._id,
      validFrom: appointment.visitDate,
      validUntil,
      qrPayload: JSON.stringify(qrPayload),
      qrImage,
      badgePdfBase64: badgePdf.toString("base64")
    });

    return res.status(201).json(pass);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyPass = async (req, res) => {
  try {
    // Security can type a code or scan a QR. Both finally send passCode here.
    const pass = await Pass.findOne({
      passCode: req.params.passCode,
      organizationId: req.user.organizationId
    })
      .populate("visitorId", "fullName email phone")
      .populate("hostId", "name")
      .populate("appointmentId", "visitDate purpose");

    if (!pass) {
      return res.status(404).json({ message: "Pass not found" });
    }

    // I update expired passes here so the security screen shows the latest status.
    if (new Date() > new Date(pass.validUntil) && pass.status !== PASS_STATUS.CHECKED_OUT) {
      console.log("Pass expired during verification", pass.passCode);
      pass.status = PASS_STATUS.EXPIRED;
      await pass.save();
    }

    return res.json(pass);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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

export const exportLogs = async (req, res) => {
  try {
    const logs = await CheckLog.find({ organizationId: req.user.organizationId })
      .populate("visitorId", "fullName")
      .populate("scannedBy", "name")
      .populate("passId", "passCode")
      .sort({ occurredAt: -1 });

    // I am making the CSV manually so I understand every column in the export.
    const rows = ["Pass Code,Visitor,Action,Location,Scanned By,Occurred At"];
    logs.forEach((log) => {
      rows.push(
        [
          log.passId?.passCode || "",
          log.visitorId?.fullName || "",
          log.action || "",
          log.location || "",
          log.scannedBy?.name || "",
          new Date(log.occurredAt).toISOString()
        ].join(",")
      );
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=check-logs.csv");
    return res.send(rows.join("\n"));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
