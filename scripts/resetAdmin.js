import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import AdminModel from "../models/Admin.js";

async function verifyAndReset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admins = await AdminModel.find();
    console.log("Found admins in database:", admins.map(a => ({ email: a.email, role: a.role, isActive: a.isActive })));

    // Ensure admin@aarnav.com has password Admin@123
    const hash = await bcrypt.hash("Admin@123", 10);
    await AdminModel.findOneAndUpdate(
      { email: "admin@aarnav.com" },
      {
        name: "Super Admin",
        email: "admin@aarnav.com",
        passwordHash: hash,
        role: "superadmin",
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log("RESET_SUCCESS: admin@aarnav.com password is now guaranteed to be: Admin@123");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

verifyAndReset();
