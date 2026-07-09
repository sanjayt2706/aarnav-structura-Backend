import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    icon: {
      type: String,
      default: ""
    },

    image: {
      type: String,
      default: ""
    },

    featured: {
      type: Boolean,
      default: false
    },

    order: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published"
    }
  },
  {
    timestamps: true
  }
);

const ServiceModel = mongoose.model("Service", serviceSchema);

export const Service = {

  async create(data) {
    return await ServiceModel.create(data);
  },

  async list({
    page = 1,
    limit = 20,
    search,
    status
  }) {

    const filter = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i"
      };
    }

    if (status)
      filter.status = status;

    const rows = await ServiceModel.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ServiceModel.countDocuments(filter);

    return {
      rows,
      total,
      page,
      limit
    };

  },

  async listAll() {
    return await ServiceModel.find()
      .sort({
        order: 1
      });
  },

  async findById(id) {
    return await ServiceModel.findById(id);
  },

  async update(id, data) {
    return await ServiceModel.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
  },

  async delete(id) {
    return await ServiceModel.findByIdAndDelete(id);
  }

};

export default ServiceModel;