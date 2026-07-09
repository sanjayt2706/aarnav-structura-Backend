import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true
    },

    ipAddress: {
      type: String,
      required: true
    },

    page: {
      type: String,
      default: "/"
    },

    country: {
      type: String,
      default: ""
    },

    city: {
      type: String,
      default: ""
    },

    browser: {
      type: String,
      default: ""
    },

    deviceType: {
      type: String,
      default: ""
    },

    os: {
      type: String,
      default: ""
    },

    referrer: {
      type: String,
      default: ""
    },

    visitedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

export const VisitModel = mongoose.model("Visit", visitSchema);

export const Visit = {

  async create(data) {
    return await VisitModel.create(data);
  },

  async list({
    page = 1,
    limit = 20,
    search,
    country,
    device,
    browser,
    dateFrom,
    dateTo
  }) {

    const filter = {};

    if (search) {

      filter.$or = [

        {
          ipAddress: {
            $regex: search,
            $options: "i"
          }
        },

        {
          city: {
            $regex: search,
            $options: "i"
          }
        },

        {
          country: {
            $regex: search,
            $options: "i"
          }
        }

      ];

    }

    if (country)
      filter.country = country;

    if (device)
      filter.deviceType = device;

    if (browser)
      filter.browser = browser;

    if (dateFrom || dateTo) {

      filter.visitedAt = {};

      if (dateFrom)
        filter.visitedAt.$gte = new Date(dateFrom);

      if (dateTo)
        filter.visitedAt.$lte = new Date(dateTo);

    }

    const rows = await VisitModel.find(filter)
      .sort({
        visitedAt: -1
      })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await VisitModel.countDocuments(filter);

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

  async stats() {

    const total = await VisitModel.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const week = new Date();
    week.setDate(week.getDate() - 7);

    const month = new Date();
    month.setDate(month.getDate() - 30);

    const todayCount = await VisitModel.countDocuments({
      visitedAt: {
        $gte: today
      }
    });

    const thisWeek = await VisitModel.countDocuments({
      visitedAt: {
        $gte: week
      }
    });

    const thisMonth = await VisitModel.countDocuments({
      visitedAt: {
        $gte: month
      }
    });

    const uniqueSessions = await VisitModel.distinct("sessionId");

    return {
      total,
      today: todayCount,
      thisWeek,
      thisMonth,
      uniqueSessions: uniqueSessions.length
    };

  },

  async dailyTrend(days = 30) {

    const from = new Date();
    from.setDate(from.getDate() - days);

    return await VisitModel.aggregate([

      {
        $match: {
          visitedAt: {
            $gte: from
          }
        }
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$visitedAt"
            }
          },
          count: {
            $sum: 1
          },
          uniqueSessions: {
            $addToSet: "$sessionId"
          }
        }
      },

      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
          unique_sessions: {
            $size: "$uniqueSessions"
          }
        }
      },

      {
        $sort: {
          date: 1
        }
      }

    ]);

  },

  async breakdown(column, limit = 10) {

    const allowed = [
      "country",
      "browser",
      "deviceType",
      "os",
      "referrer"
    ];

    const field = allowed.includes(column)
      ? column
      : "country";

    return await VisitModel.aggregate([

      {
        $match: {
          [field]: {
            $ne: ""
          }
        }
      },

      {
        $group: {
          _id: `$${field}`,
          count: {
            $sum: 1
          }
        }
      },

      {
        $sort: {
          count: -1
        }
      },

      {
        $limit: limit
      },

      {
        $project: {
          _id: 0,
          label: "$_id",
          count: 1
        }
      }

    ]);

  }

};

export default VisitModel;