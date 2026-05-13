import nodemailer from "nodemailer";
import twilio from "twilio";

export const sendEmailNotification = async ({ to, subject, message }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`Email not sent to ${to}. Add SMTP_HOST, SMTP_USER and SMTP_PASS to .env.`);
    return;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailResult = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: message
  });

  console.log(`Email sent to ${to}: ${mailResult.messageId}`);
};

export const sendSmsNotification = async ({ to, message }) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`SMS not sent to ${to}. Add Twilio credentials to .env.`);
    return;
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const smsResult = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });

  console.log(`SMS sent to ${to}: ${smsResult.sid}`);
};
