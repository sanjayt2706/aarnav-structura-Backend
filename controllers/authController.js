import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

import { Admin } from "../models/Admin.js";
import { asyncHandler, checkValidation } from "../middleware/errorHandler.js";
import { sendPasswordReset } from "../utils/mailer.js";

function signToken(admin) {
  return jwt.sign(
    {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h"
    }
  );
}

export const login = asyncHandler(async (req, res) => {
  if (checkValidation(req, res)) return;

  const { email, password } = req.body;
  const ip = req.ip;

  const admin = await Admin.findByEmail(email);

  if (!admin || !admin.isActive) {
    await Admin.logLogin({
      adminId: admin?._id,
      email,
      success: false,
      ip,
      userAgent: req.headers["user-agent"]
    });

    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const match = await bcrypt.compare(password, admin.passwordHash);

  if (!match) {
    await Admin.logLogin({
      adminId: admin._id,
      email,
      success: false,
      ip,
      userAgent: req.headers["user-agent"]
    });

    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  await Admin.logLogin({
    adminId: admin._id,
    email,
    success: true,
    ip,
    userAgent: req.headers["user-agent"]
  });

  const token = signToken(admin);

  res.json({
    success: true,
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
});

export const me = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found"
    });
  }

  res.json({
    success: true,
    data: admin
  });
});

export const logout = asyncHandler(async (req, res) => {
  await Admin.logActivity({
    adminId: req.admin.id,
    action: "auth.logout",
    ip: req.ip
  });

  res.json({
    success: true,
    message: "Logged out"
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  if (checkValidation(req, res)) return;

  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findByEmail(req.admin.email);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found"
    });
  }

  const match = await bcrypt.compare(
    currentPassword,
    admin.passwordHash
  );

  if (!match) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect"
    });
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await Admin.updatePassword(admin._id, hash);

  res.json({
    success: true,
    message: "Password updated"
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findByEmail(email);

  if (!admin) {
    return res.json({
      success: true,
      message: "If that email exists, a reset link has been sent"
    });
  }

  const token = randomBytes(32).toString("hex");

  const expires = new Date(
    Date.now() + 1000 * 60 * 60
  );

  await Admin.setResetToken(
    admin._id,
    token,
    expires
  );

  const resetUrl =
    `${process.env.ADMIN_URL}/reset-password?token=${token}`;

  await sendPasswordReset(admin, resetUrl);

  res.json({
    success: true,
    message: "If that email exists, a reset link has been sent"
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const admin = await Admin.findByResetToken(token);

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token"
    });
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await Admin.updatePassword(admin._id, hash);

  res.json({
    success: true,
    message: "Password reset — you can now log in"
  });
});