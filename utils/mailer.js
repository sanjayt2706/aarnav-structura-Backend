import nodemailer from "nodemailer";
import logger from "../config/logger.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined
});

async function safeSend(options) {
  try {
    await transporter.sendMail({ from: process.env.MAIL_FROM, ...options });
    logger.info(`Email sent: ${options.subject} -> ${options.to}`);
  } catch (err) {
    // Never let email failure break the enquiry flow — just log it.
    logger.error(`Email failed (${options.subject} -> ${options.to}): ${err.message}`);
  }
}

export async function sendCustomerConfirmation(enquiry) {
  await safeSend({
    to: enquiry.email,
    subject: "We've received your project brief — Aarnav Structura",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color:#1a1a1a;">
        <h2 style="color:#B8862E;">Thank you, ${enquiry.fullName}.</h2>
        <p>We've received your project brief and will get back to you within <strong>24 hours</strong>.</p>
        <table style="width:100%; border-collapse: collapse; margin-top:16px;">
          <tr><td style="padding:6px 0; color:#666;">Project type</td><td>${enquiry.projectType || "—"}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Budget</td><td>${enquiry.budget || "—"}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Location</td><td>${enquiry.location || "—"}</td></tr>
        </table>
        <p style="margin-top:20px;">If it's urgent, call us at <strong>+91 77603 76348</strong> or WhatsApp <strong>+91 87623 98728</strong>.</p>
        <p style="color:#999; font-size:12px; margin-top:32px;">Aarnav Structura · Shivamogga, Karnataka</p>
      </div>`
  });
}

export async function sendCompanyNotification(enquiry) {
  await safeSend({
    to: process.env.COMPANY_NOTIFY_EMAIL,
    subject: `New enquiry — ${enquiry.fullName} (${enquiry.projectType || "General"})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px;">
        <h3>New website enquiry</h3>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:4px 0; color:#666;">Name</td><td>${enquiry.fullName}</td></tr>
          <tr><td style="padding:4px 0; color:#666;">Phone</td><td>${enquiry.phoneNumber}</td></tr>
          <tr><td style="padding:4px 0; color:#666;">Email</td><td>${enquiry.email || "—"}</td></tr>
          <tr><td style="padding:4px 0; color:#666;">Location</td><td>${enquiry.location || "—"}</td></tr>
          <tr><td style="padding:4px 0; color:#666;">Project type</td><td>${enquiry.projectType || "—"}</td></tr>
          <tr><td style="padding:4px 0; color:#666;">Budget</td><td>${enquiry.budget || "—"}</td></tr>
        </table>
        <p style="margin-top:12px;"><strong>Brief:</strong><br/>${(enquiry.projectBrief || "—").replace(/\n/g, "<br/>")}</p>
      </div>`
  });
}

export async function sendPasswordReset(admin, resetUrl) {
  await safeSend({
    to: admin.email,
    subject: "Reset your Aarnav Structura admin password",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <p>Hi ${admin.name},</p>
        <p>Click below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}" style="background:#B8862E;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Reset Password</a></p>
        <p>If you didn't request this, ignore this email.</p>
      </div>`
  });
}
