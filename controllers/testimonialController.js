import { Testimonial } from "../models/Testimonial.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAllTestimonials = asyncHandler(async (req, res) => {
  const result = await Testimonial.list({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search,
    status: req.query.status
  });

  res.json({
    success: true,
    ...result
  });
});

export const getTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return res.status(404).json({
      success: false,
      message: "Testimonial not found"
    });
  }

  res.json({
    success: true,
    data: testimonial
  });
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.image = `/uploads/testimonials/${req.file.filename}`;
  }

  const testimonial = await Testimonial.create(body);

  res.status(201).json({
    success: true,
    data: testimonial
  });
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.image = `/uploads/testimonials/${req.file.filename}`;
  }

  const testimonial = await Testimonial.update(req.params.id, body);

  if (!testimonial) {
    return res.status(404).json({
      success: false,
      message: "Testimonial not found"
    });
  }

  res.json({
    success: true,
    data: testimonial
  });
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  await Testimonial.delete(req.params.id);

  res.json({
    success: true,
    message: "Testimonial deleted"
  });
});