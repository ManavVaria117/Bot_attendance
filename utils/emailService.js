// utils/emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  // host: process.env.EMAIL_HOST,
  // port: process.env.EMAIL_PORT,
  // secure: false,
  // // service: "gmail", // or "Outlook", "Yahoo", or use `host` + `port` for SMTP
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Attendance Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO, // comma-separated list if needed
      subject,
      text,
    });
    console.log("📧 Email sent!");
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};

module.exports = sendEmail;
