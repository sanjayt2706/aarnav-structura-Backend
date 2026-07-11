import nodemailer from "nodemailer";
import logger from "../config/logger.js";

// Render's dashboard (unlike a shell-parsed .env file) does NOT strip quote
// characters from environment variable values — if a value is entered as
// SMTP_PASSWORD="abcd efgh" the app sees the literal quotes as part of the
// string, which silently breaks SMTP auth. Strip them defensively so a
// copy-paste mistake in the Render UI can't quietly kill email delivery.
const unquote = (v) => (typeof v === "string" ? v.trim().replace(/^["'](.*)["']$/, "$1") : v);

const SMTP_USER = unquote(process.env.SMTP_USER);
const SMTP_PASSWORD = unquote(process.env.SMTP_PASSWORD);
const MAIL_FROM = unquote(process.env.MAIL_FROM) || `"Aarnav Structura" <${SMTP_USER}>`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
  // Fail fast instead of hanging ~2 minutes on a blocked connection —
  // makes it obvious within seconds whether this port is reachable at all.
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

// Verify SMTP connection when server starts
transporter.verify((err, success) => {
  if (err) {
    logger.error("❌ SMTP Verification Failed");
    logger.error(`Using port ${process.env.SMTP_PORT} (secure=${process.env.SMTP_SECURE})`);
    logger.error(err);
  } else {
    logger.info(`✅ SMTP Server Connected (port ${process.env.SMTP_PORT}, secure=${process.env.SMTP_SECURE})`);
  }
});

async function safeSend(options) {
  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      ...options,
    });

    logger.info(`✅ Email handed off to SMTP server`);
    logger.info(`To: ${options.to}`);
    logger.info(`Subject: ${options.subject}`);
    logger.info(`Message ID: ${info.messageId}`);
    logger.info(`Accepted: ${JSON.stringify(info.accepted)}`);
    logger.info(`Rejected: ${JSON.stringify(info.rejected)}`);
    logger.info(`Gmail response: ${info.response}`);

    return info;
  } catch (err) {
    logger.error("❌ Email Sending Failed");
    logger.error(`To: ${options.to}`);
    logger.error(`Subject: ${options.subject}`);
    logger.error(err);
  }
}

export async function sendCustomerConfirmation(enquiry) {
  if (!enquiry.email) return;

  return safeSend({
    to: enquiry.email,
    subject: "We've received your project enquiry - Aarnav Structura",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;">
        <h2 style="color:#B8862E;">Thank you ${enquiry.fullName}!</h2>

        <p>We have successfully received your enquiry.</p>

        <p>Our team will contact you within <strong>24 hours</strong>.</p>

        <hr>

        <h3>Your Submission</h3>

        <table style="border-collapse:collapse;width:100%;">
          <tr>
            <td><b>Name</b></td>
            <td>${enquiry.fullName}</td>
          </tr>

          <tr>
            <td><b>Phone</b></td>
            <td>${enquiry.phoneNumber}</td>
          </tr>

          <tr>
            <td><b>Email</b></td>
            <td>${enquiry.email}</td>
          </tr>

          <tr>
            <td><b>Location</b></td>
            <td>${enquiry.location || "-"}</td>
          </tr>

          <tr>
            <td><b>Project Type</b></td>
            <td>${enquiry.projectType || "-"}</td>
          </tr>

          <tr>
            <td><b>Budget</b></td>
            <td>${enquiry.budget || "-"}</td>
          </tr>
        </table>

        <br>

        <b>Project Brief</b>

        <p>${(enquiry.projectBrief || "-").replace(/\n/g, "<br>")}</p>

        <hr>

        <p>
            Regards,<br>
            <b>Aarnav Structura</b><br>
            Shivamogga, Karnataka
        </p>

      </div>
    `,
  });
}

export async function sendCompanyNotification(enquiry) {
  return safeSend({
    to: process.env.COMPANY_NOTIFY_EMAIL,
    subject: `🚨 New Website Enquiry - ${enquiry.fullName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;">

        <h2>New Website Enquiry</h2>

        <table style="border-collapse:collapse;width:100%;">

          <tr>
            <td><b>Name</b></td>
            <td>${enquiry.fullName}</td>
          </tr>

          <tr>
            <td><b>Phone</b></td>
            <td>${enquiry.phoneNumber}</td>
          </tr>

          <tr>
            <td><b>Email</b></td>
            <td>${enquiry.email || "-"}</td>
          </tr>

          <tr>
            <td><b>Location</b></td>
            <td>${enquiry.location || "-"}</td>
          </tr>

          <tr>
            <td><b>Project Type</b></td>
            <td>${enquiry.projectType || "-"}</td>
          </tr>

          <tr>
            <td><b>Budget</b></td>
            <td>${enquiry.budget || "-"}</td>
          </tr>

        </table>

        <br>

        <b>Project Brief</b>

        <p>${(enquiry.projectBrief || "-").replace(/\n/g, "<br>")}</p>

      </div>
    `,
  });
}

export async function sendPasswordReset(admin, resetUrl) {
  return safeSend({
    to: admin.email,
    subject: "Reset Your Aarnav Structura Password",
    html: `
      <div style="font-family:Arial,sans-serif">

        <h2>Password Reset</h2>

        <p>Hello ${admin.name},</p>

        <p>You requested a password reset.</p>

        <p>
          <a href="${resetUrl}"
             style="padding:12px 24px;
                    background:#B8862E;
                    color:white;
                    text-decoration:none;
                    border-radius:5px;">
              Reset Password
          </a>
        </p>

        <p>This link expires in 1 hour.</p>

      </div>
    `,
  });
}