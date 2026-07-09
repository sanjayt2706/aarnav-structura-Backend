import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "editor"],
      default: "admin"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    resetToken: {
      type: String,
      default: null
    },

    resetTokenExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const AdminModel = mongoose.model("Admin", adminSchema);

const LoginLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },

    email: String,

    success: Boolean,

    ipAddress: String,

    userAgent: String
  },
  {
    timestamps: true
  }
);

const ActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },

    action: {
      type: String,
      required: true
    },

    entityType: String,

    entityId: String,

    details: mongoose.Schema.Types.Mixed,

    ipAddress: String
  },
  {
    timestamps: true
  }
);

const LoginLog = mongoose.model("LoginLog", LoginLogSchema);

const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);

export const Admin = {

  async create(data) {
    return await AdminModel.create(data);
  },

  async findByEmail(email) {
    return await AdminModel.findOne({
      email: email.toLowerCase()
    });
  },

  async findById(id) {
    return await AdminModel.findById(id).select(
      "name email role isActive createdAt"
    );
  },

  async updatePassword(id, passwordHash) {
    return await AdminModel.findByIdAndUpdate(
      id,
      {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null
      },
      {
        new: true
      }
    );
  },

  async setResetToken(id, token, expires) {
    return await AdminModel.findByIdAndUpdate(
      id,
      {
        resetToken: token,
        resetTokenExpires: expires
      },
      {
        new: true
      }
    );
  },

  async findByResetToken(token) {
    return await AdminModel.findOne({
      resetToken: token,
      resetTokenExpires: {
        $gt: new Date()
      }
    });
  },

  async logLogin({
    adminId,
    email,
    success,
    ip,
    userAgent
  }) {
    return await LoginLog.create({
      adminId,
      email,
      success,
      ipAddress: ip,
      userAgent
    });
  },

  async logActivity({
    adminId,
    action,
    entityType,
    entityId,
    details,
    ip
  }) {
    return await ActivityLog.create({
      adminId,
      action,
      entityType,
      entityId,
      details,
      ipAddress: ip
    });
  }

};

export default AdminModel;