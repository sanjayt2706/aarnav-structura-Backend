import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      default: "General"
    },

    image: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const GalleryModel = mongoose.model("Gallery", gallerySchema);

export const Gallery = {
  async create(data) {
    return await GalleryModel.create(data);
  },

  async list({
    page = 1,
    limit = 20,
    search,
    category,
    featured
  }) {
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    if (category)
      filter.category = category;

    if (featured !== undefined)
      filter.featured = featured;

    const rows = await GalleryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await GalleryModel.countDocuments(filter);

    return {
      rows,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  },

  async listAll() {
    return await GalleryModel.find().sort({
      createdAt: -1
    });
  },

  async findById(id) {
    return await GalleryModel.findById(id);
  },

  async update(id, data) {
    return await GalleryModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true
      }
    );
  },

  async delete(id) {
    return await GalleryModel.findByIdAndDelete(id);
  },

  async stats() {
    return {
      total: await GalleryModel.countDocuments(),
      featured: await GalleryModel.countDocuments({
        featured: true
      })
    };
  }
};

export default GalleryModel;