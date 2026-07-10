import nodemailer from "nodemailer";
import logger from "../config/logger.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify SMTP connection when server starts
transporter.verify((err, success) => {
  if (err) {
    logger.error("❌ SMTP Verification Failed");
    logger.error(err);
  } else {
    logger.info("✅ SMTP Server Connected");
  }
});

async function safeSend(options) {
  try {
    const info = await transporter.sendMail({
      from: `"Aarnav Structura" <${process.env.SMTP_USER}>`,
      ...options,
    });

    logger.info(`✅ Email sent successfully`);
    logger.info(`To: ${options.to}`);
    logger.info(`Subject: ${options.subject}`);
    logger.info(`Message ID: ${info.messageId}`);

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