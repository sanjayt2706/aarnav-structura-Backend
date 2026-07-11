import { Resend } from "resend";
import logger from "../config/logger.js";

// Both port 587 and 465 timed out connecting to Gmail's SMTP servers from
// Render's free tier — a network-level block, not an auth issue (confirmed:
// the connection never got far enough to attempt login). Resend sends over
// plain HTTPS (port 443), which hosting providers essentially never block,
// so it sidesteps the problem entirely instead of fighting Render's network.
const resend = new Resend(process.env.RESEND_API_KEY);

// Until you verify your own domain (aarnavstructura.com) in the Resend
// dashboard, you can only send FROM Resend's sandbox address below — it's
// allowed to send TO any recipient without domain verification, so email
// delivery works today. Once your domain is verified in Resend, set
// MAIL_FROM=Aarnav Structura <no-reply@aarnavstructura.com> in Render's env
// vars and this will automatically switch to using it.
const MAIL_FROM = process.env.MAIL_FROM || "Aarnav Structura <onboarding@resend.dev>";

async function safeSend({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: MAIL_FROM,
      to: to.split(",").map((s) => s.trim()),
      subject,
      html,
    });

    if (error) {
      logger.error("❌ Email Sending Failed");
      logger.error(`To: ${to}`);
      logger.error(`Subject: ${subject}`);
      logger.error(JSON.stringify(error));
      return null;
    }

    logger.info(`✅ Email sent successfully`);
    logger.info(`To: ${to}`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Resend ID: ${data?.id}`);

    return data;
  } catch (err) {
    logger.error("❌ Email Sending Failed (exception)");
    logger.error(`To: ${to}`);
    logger.error(`Subject: ${subject}`);
    logger.error(err);
    return null;
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