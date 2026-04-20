export const sendEmailNotification = async ({ to, subject, message }) => {
  console.log("Email notification", { to, subject, message });
  return { channel: "email", delivered: true };
};

export const sendSmsNotification = async ({ to, message }) => {
  console.log("SMS notification", { to, message });
  return { channel: "sms", delivered: true };
};
