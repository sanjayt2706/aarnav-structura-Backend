import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    designation: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      default: ""
    },

    photo: {
      type: String,
      default: ""
    },

    email: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    },

    linkedin: {
      type: String,
      default: ""
    },

    linkedin_url: {
      type: String,
      default: ""
    },

    instagram: {
      type: String,
      default: ""
    },

    experience: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    },

    order: {
      type: Number,
      default: 0
    },

    display_order: {
      type: Number,
      default: 0
    },

    active: {
      type: Boolean,
      default: true
    },

    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const TeamModel = mongoose.model("Team", teamSchema);

export const Team = {

  async create(data) {
    return await TeamModel.create(data);
  },

  async list({
    page = 1,
    limit = 20,
    search
  }) {

    const filter = {};

    if (search) {

      filter.$or = [

        {
          name: {
            $regex: search,
            $options: "i"
          }
        },

        {
          designation: {
            $regex: search,
            $options: "i"
          }
        },

        {
          role: {
            $regex: search,
            $options: "i"
          }
        }

      ];

    }

    const rows = await TeamModel.find(filter)
      .sort({
        display_order: 1,
        order: 1,
        createdAt: 1
      })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await TeamModel.countDocuments(filter);

    return {
      rows,
      total,
      page,
      limit
    };

  },

  async listAll() {

    return await TeamModel.find()
      .sort({
        order: 1
      });

  },

  async findById(id) {

    return await TeamModel.findById(id);

  },

  async update(id, data) {

    return await TeamModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true
      }
    );

  },

  async delete(id) {

    return await TeamModel.findByIdAndDelete(id);

  }

};

export default TeamModel;