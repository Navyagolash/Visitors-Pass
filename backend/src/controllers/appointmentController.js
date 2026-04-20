import { Appointment } from "../models/Appointment.js";
import { Visitor } from "../models/Visitor.js";
import { User } from "../models/User.js";
import { APPOINTMENT_STATUS, ROLES } from "../config/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmailNotification, sendSmsNotification } from "../utils/notifications.js";

export const listAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ organizationId: req.user.organizationId })
    .populate("visitorId", "fullName email phone company")
    .populate("hostId", "name email role")
    .sort({ visitDate: 1 });

  res.json(appointments);
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
    message: `Your appointment for ${new Date(visitDate).toLocaleString()} is pending approval.`
  });

  res.status(201).json(appointment);
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, approvalNote } = req.body;
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  }).populate("visitorId", "fullName email phone");

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  const canModerate =
    req.user.role === ROLES.ADMIN ||
    req.user.role === ROLES.SECURITY ||
    String(appointment.hostId) === String(req.user._id);

  if (!canModerate) {
    res.status(403);
    throw new Error("You cannot update this appointment");
  }

  appointment.status = status ?? appointment.status;
  appointment.approvalNote = approvalNote ?? appointment.approvalNote;
  await appointment.save();

  await sendEmailNotification({
    to: appointment.visitorId.email,
    subject: `Appointment ${appointment.status}`,
    message: `Your appointment has been marked as ${appointment.status}.`
  });

  if (appointment.visitorId.phone) {
    await sendSmsNotification({
      to: appointment.visitorId.phone,
      message: `Appointment status: ${appointment.status}`
    });
  }

  res.json(appointment);
});

export const statsSummary = asyncHandler(async (req, res) => {
  const [total, pending, approved] = await Promise.all([
    Appointment.countDocuments({ organizationId: req.user.organizationId }),
    Appointment.countDocuments({
      organizationId: req.user.organizationId,
      status: APPOINTMENT_STATUS.PENDING
    }),
    Appointment.countDocuments({
      organizationId: req.user.organizationId,
      status: APPOINTMENT_STATUS.APPROVED
    })
  ]);

  res.json({ totalAppointments: total, pendingAppointments: pending, approvedAppointments: approved });
});
