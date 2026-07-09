import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import AdminModel from "../models/Admin.js";

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await AdminModel.findOne({
      email: "admin@aarnav.com"
    });

    if (existing) {
      console.log("✅ Admin already exists");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("Admin@123", 10);

    await AdminModel.create({
      name: "Super Admin",
      email: "admin@aarnav.com",
      passwordHash,
      role: "superadmin",
      isActive: true
    });

    console.log("=================================");
    console.log("✅ Admin Created Successfully");
    console.log("Email    : admin@aarnav.com");
    console.log("Password : Admin@123");
    console.log("=================================");

    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();