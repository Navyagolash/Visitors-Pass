import { Appointment } from "../models/Appointment.js";
import { Visitor } from "../models/Visitor.js";
import { User } from "../models/User.js";
import { APPOINTMENT_STATUS, ROLES } from "../config/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmailNotification, sendSmsNotification } from "../utils/notifications.js";

export const listAppointments = asyncHandler(async (req, res) => {
  const { status, hostId, company, dateFrom, dateTo, q = "" } = req.query;
  const query = { organizationId: req.user.organizationId };

  if (status) {
    query.status = status;
  }

  if (hostId) {
    query.hostId = hostId;
  }

  if (dateFrom || dateTo) {
    query.visitDate = {};
    if (dateFrom) {
      query.visitDate.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      query.visitDate.$lte = new Date(dateTo);
    }
  }

  const appointments = await Appointment.find(query)
    .populate("visitorId", "fullName email phone company")
    .populate("hostId", "name email role")
    .sort({ visitDate: 1 });

  const filteredAppointments = appointments.filter((item) => {
    const matchesSearch =
      !q ||
      item.visitorId?.fullName?.toLowerCase().includes(q.toLowerCase()) ||
      item.purpose?.toLowerCase().includes(q.toLowerCase());

    const matchesCompany =
      !company || item.visitorId?.company?.toLowerCase().includes(company.toLowerCase());

    return matchesSearch && matchesCompany;
  });

  res.json(filteredAppointments);
});

export const createAppointment = asyncHandler(async (req, res) => {
  const { visitorId, hostId, visitDate, purpose, notes } = req.body;

  const visitor = await Visitor.findOne({ _id: visitorId, organizationId: req.user.organizationId });
  const host = await User.findOne({ _id: hostId, organizationId: req.user.organizationId });

  if (!visitor || !host) {
    res.status(400);
    throw new Error("Visitor or host not found");
  }

  const appointment = await Appointment.create({
    organizationId: req.user.organizationId,
    visitorId,
    hostId,
    visitDate,
    purpose,
    notes
  });

  await sendEmailNotification({
    to: visitor.email,
    subject: "Visitor appointment created",
    message: `Hi ${visitor.fullName}, your appointment for ${new Date(visitDate).toLocaleString()} is pending approval.`
  });

  if (visitor.phone) {
    await sendSmsNotification({
      to: visitor.phone,
      message: `Your appointment request for ${new Date(visitDate).toLocaleString()} is pending approval.`
    });
  }

  res.status(201).json(appointment);
});

export const updateAppointmentStatus = async (req, res) => {
  try {
    const status = req.body.status;
    const approvalNote = req.body.approvalNote;

    // I am checking the status first because only these values are allowed in the model.
    if (!Object.values(APPOINTMENT_STATUS).includes(status)) {
      return res.status(400).json({ message: "Choose a valid appointment status" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
      .populate("visitorId", "fullName email phone")
      .populate("hostId", "_id");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // My rule: admin/security can approve all appointments.
    // An employee can approve only when they are the host for this appointment.
    let allowed = false;
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SECURITY) {
      allowed = true;
    }
    if (String(appointment.hostId._id) === String(req.user._id)) {
      allowed = true;
    }

    if (!allowed) {
      console.log("Appointment status blocked for user", String(req.user._id));
      return res.status(403).json({ message: "You cannot update this appointment" });
    }

    appointment.status = status;
    if (approvalNote) {
      appointment.approvalNote = approvalNote;
    }
    await appointment.save();

    await sendEmailNotification({
      to: appointment.visitorId.email,
      subject: `Appointment ${appointment.status}`,
      message: `Hi ${appointment.visitorId.fullName}, your appointment has been marked as ${appointment.status}.`
    });

    if (appointment.visitorId.phone) {
      await sendSmsNotification({
        to: appointment.visitorId.phone,
        message: `Appointment status updated to ${appointment.status}.`
      });
    }

    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const statsSummary = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // These are the three numbers I show at the top of the dashboard.
    const totalAppointments = await Appointment.countDocuments({ organizationId });
    const pendingAppointments = await Appointment.countDocuments({
      organizationId,
      status: APPOINTMENT_STATUS.PENDING
    });
    const approvedAppointments = await Appointment.countDocuments({
      organizationId,
      status: APPOINTMENT_STATUS.APPROVED
    });

    return res.json({ totalAppointments, pendingAppointments, approvedAppointments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
