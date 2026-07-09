import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      default: "Construction"
    },

    location: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    image: {
      type: String,
      default: ""
    },

    images: [
      {
        type: String
      }
    ],

    featured: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Published"
    }
  },
  {
    timestamps: true
  }
);

const ProjectModel = mongoose.model("Project", projectSchema);

export const Project = {
  async create(data) {
    return await ProjectModel.create(data);
  },

  async list({
    page = 1,
    limit = 20,
    search,
    category,
    status,
    featured
  }) {
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    if (category)
      filter.category = category;

    if (status)
      filter.status = status;

    if (featured !== undefined)
      filter.featured = featured;

    const rows = await ProjectModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ProjectModel.countDocuments(filter);

    return {
      rows,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  },

  async listAll() {
    return await ProjectModel.find().sort({
      createdAt: -1
    });
  },

  async findById(id) {
    return await ProjectModel.findById(id);
  },

  async update(id, data) {
    return await ProjectModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true
      }
    );
  },

  async delete(id) {
    return await ProjectModel.findByIdAndDelete(id);
  },

  async stats() {
    return {
      total: await ProjectModel.countDocuments(),
      featured: await ProjectModel.countDocuments({
        featured: true
      }),
      published: await ProjectModel.countDocuments({
        status: "Published"
      }),
      draft: await ProjectModel.countDocuments({
        status: "Draft"
      })
    };
  }
};

export default ProjectModel;