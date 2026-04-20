import dotenv from "dotenv";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Visitor } from "../models/Visitor.js";
import { Appointment } from "../models/Appointment.js";
import { Pass } from "../models/Pass.js";
import { CheckLog } from "../models/CheckLog.js";
import { APPOINTMENT_STATUS, CHECK_ACTION, PASS_STATUS, ROLES } from "../config/constants.js";

dotenv.config();

const organizationId = "acme-hq";

const run = async () => {
  await connectDb();
  await Promise.all([
    CheckLog.deleteMany({}),
    Pass.deleteMany({}),
    Appointment.deleteMany({}),
    Visitor.deleteMany({}),
    User.deleteMany({})
  ]);

  const [admin, security, employee] = await User.create([
    {
      name: "Asha Admin",
      email: "admin@acme.com",
      password: "Password123!",
      role: ROLES.ADMIN,
      organizationId,
      department: "Operations",
      phone: "9999999991"
    },
    {
      name: "Sam Security",
      email: "security@acme.com",
      password: "Password123!",
      role: ROLES.SECURITY,
      organizationId,
      department: "Front Desk",
      phone: "9999999992"
    },
    {
      name: "Esha Employee",
      email: "employee@acme.com",
      password: "Password123!",
      role: ROLES.EMPLOYEE,
      organizationId,
      department: "Engineering",
      phone: "9999999993"
    }
  ]);

  const [visitorOne, visitorTwo] = await Visitor.create([
    {
      organizationId,
      fullName: "Rohan Verma",
      email: "rohan@example.com",
      phone: "9999999994",
      company: "Vertex Labs",
      purpose: "Product demo",
      createdBy: employee._id,
      photoUrl: "https://placehold.co/200x240"
    },
    {
      organizationId,
      fullName: "Meera Nair",
      email: "meera@example.com",
      phone: "9999999995",
      company: "BlueSky Ventures",
      purpose: "Investor meeting",
      createdBy: employee._id,
      photoUrl: "https://placehold.co/200x240"
    }
  ]);

  const [approvedAppointment, pendingAppointment] = await Appointment.create([
    {
      organizationId,
      visitorId: visitorOne._id,
      hostId: employee._id,
      visitDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      purpose: "Product demo",
      status: APPOINTMENT_STATUS.APPROVED,
      notes: "Bring prototype brochure"
    },
    {
      organizationId,
      visitorId: visitorTwo._id,
      hostId: employee._id,
      visitDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      purpose: "Investor meeting",
      status: APPOINTMENT_STATUS.PENDING,
      notes: "Discuss Q2 updates"
    }
  ]);

  const pass = await Pass.create({
    organizationId,
    passCode: "VP-DEMO1234",
    visitorId: visitorOne._id,
    appointmentId: approvedAppointment._id,
    hostId: employee._id,
    validFrom: approvedAppointment.visitDate,
    validUntil: new Date(new Date(approvedAppointment.visitDate).getTime() + 8 * 60 * 60 * 1000),
    qrPayload: JSON.stringify({ passCode: "VP-DEMO1234", organizationId }),
    qrImage: "",
    badgePdfBase64: "",
    status: PASS_STATUS.CHECKED_IN
  });

  await CheckLog.create({
    organizationId,
    passId: pass._id,
    visitorId: visitorOne._id,
    scannedBy: security._id,
    action: CHECK_ACTION.IN,
    location: "Main Gate",
    notes: "Seeded demo check-in"
  });

  console.log("Seed data created");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
