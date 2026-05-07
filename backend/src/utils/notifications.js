import nodemailer from "nodemailer";
import twilio from "twilio";

const smsRateWindow = new Map();

const canSendSmsNow = (phone) => {
  const lastSentTime = smsRateWindow.get(phone) || 0;
  const now = Date.now();

  if (now - lastSentTime < 30 * 1000) {
    return false;
  }

  smsRateWindow.set(phone, now);
  return true;
};

const createMailTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const isPhoneNumberValid = (phone) => /^\+?[1-9]\d{9,14}$/.test(phone || "");

export const sendEmailNotification = async ({ to, subject, message }) => {
  const transporter = createMailTransport();

  if (!transporter) {
    console.log("Email notification skipped because SMTP is not configured", { to, subject });
    return { channel: "email", delivered: false, reason: "smtp_not_configured" };
  }

  const mailResult = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text: message
  });

  return { channel: "email", delivered: true, providerId: mailResult.messageId };
};

export const sendSmsNotification = async ({ to, message }) => {
  if (!isPhoneNumberValid(to)) {
    return { channel: "sms", delivered: false, reason: "invalid_phone_number" };
  }

  if (!canSendSmsNow(to)) {
    return { channel: "sms", delivered: false, reason: "rate_limited" };
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log("SMS notification skipped because Twilio is not configured", { to });
    return { channel: "sms", delivered: false, reason: "twilio_not_configured" };
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const smsResult = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });

  return { channel: "sms", delivered: true, providerId: smsResult.sid };
};
