import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true
    },

    company: {
      type: String,
      default: ""
    },

    designation: {
      type: String,
      default: ""
    },

    review: {
      type: String,
      required: true
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
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

const TestimonialModel = mongoose.model(
  "Testimonial",
  testimonialSchema
);

export const Testimonial = {
  async create(data) {
    return await TestimonialModel.create(data);
  },

  async list({
    page = 1,
    limit = 20,
    search,
    status
  }) {

    const filter = {};

    if (search) {

      filter.$or = [
        {
          clientName: {
            $regex: search,
            $options: "i"
          }
        },
        {
          company: {
            $regex: search,
            $options: "i"
          }
        }
      ];

    }

    if (status)
      filter.status = status;

    const rows = await TestimonialModel.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await TestimonialModel.countDocuments(filter);

    return {
      rows,
      total,
      page,
      limit
    };
  },

  async listAll() {
    return await TestimonialModel.find()
      .sort({ order: 1 });
  },

  async findById(id) {
    return await TestimonialModel.findById(id);
  },

  async update(id, data) {
    return await TestimonialModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true
      }
    );
  },

  async delete(id) {
    return await TestimonialModel.findByIdAndDelete(id);
  }
};

export default TestimonialModel;