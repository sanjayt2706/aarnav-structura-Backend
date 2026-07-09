import mongoose from "mongoose";

export const STATUSES = [
  "New",
  "Contacted",
  "Meeting Scheduled",
  "Quotation Sent",
  "Won",
  "Lost",
  "Completed"
];

const enquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      default: null,
      trim: true
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      default: null
    },

    projectType: {
      type: String,
      default: null
    },

    budget: {
      type: String,
      default: null
    },

    projectBrief: {
      type: String,
      default: null
    },

    ipAddress: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: STATUSES,
      default: "New"
    },

    adminNotes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const EnquiryModel = mongoose.model("Enquiry", enquirySchema);

export const Enquiry = {
  STATUSES,

  async create(data, ip) {
    return await EnquiryModel.create({
      fullName: data.fullName,
      email: data.email || null,
      phoneNumber: data.phoneNumber,
      location: data.location || null,
      projectType: data.projectType || null,
      budget: data.budget || null,
      projectBrief: data.projectBrief || null,
      ipAddress: ip || null
    });
  },

  async list({
    page = 1,
    limit = 20,
    search,
    status,
    projectType,
    dateFrom,
    dateTo,
    sortBy = "createdAt",
    sortDir = "DESC"
  }) {
    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    if (status) filter.status = status;

    if (projectType) filter.projectType = projectType;

    if (dateFrom || dateTo) {
      filter.createdAt = {};

      if (dateFrom)
        filter.createdAt.$gte = new Date(dateFrom);

      if (dateTo)
        filter.createdAt.$lte = new Date(dateTo);
    }

    const rows = await EnquiryModel.find(filter)
      .sort({
        [sortBy]: sortDir?.toUpperCase() === "ASC" ? 1 : -1
      })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await EnquiryModel.countDocuments(filter);

    return {
      rows,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  },

  async listAll(filters) {
    return (
      await this.list({
        ...filters,
        page: 1,
        limit: 100000
      })
    ).rows;
  },

  async findById(id) {
    return await EnquiryModel.findById(id);
  },

  async updateStatus(id, status, adminNotes) {
    return await EnquiryModel.findByIdAndUpdate(
      id,
      {
        status,
        adminNotes
      },
      {
        new: true
      }
    );
  },

  async bulkUpdateStatus(ids, status) {
    const result = await EnquiryModel.updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        status
      }
    );

    return result.modifiedCount;
  },

  async delete(id) {
    return await EnquiryModel.findByIdAndDelete(id);
  },

  async bulkDelete(ids) {
    const result = await EnquiryModel.deleteMany({
      _id: {
        $in: ids
      }
    });

    return result.deletedCount;
  },

  async stats() {
    const total = await EnquiryModel.countDocuments();

    const completed = await EnquiryModel.countDocuments({
      status: "Completed"
    });

    const won = await EnquiryModel.countDocuments({
      status: "Won"
    });

    const pending = await EnquiryModel.countDocuments({
      status: {
        $in: [
          "New",
          "Contacted",
          "Meeting Scheduled",
          "Quotation Sent"
        ]
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await EnquiryModel.countDocuments({
      createdAt: {
        $gte: today
      }
    });

    return {
      total,
      completed,
      pending,
      today: todayCount,
      won,
      conversionRate:
        total > 0
          ? Number(((won / total) * 100).toFixed(1))
          : 0
    };
  },

  async trend(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const rows = await EnquiryModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: from
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);

    return rows.map(item => ({
      date: item._id,
      count: item.count
    }));
  }
};

export default EnquiryModel;