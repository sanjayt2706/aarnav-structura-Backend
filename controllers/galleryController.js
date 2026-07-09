import { Gallery } from "../models/Gallery.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAllGallery = asyncHandler(async (req, res) => {
  const result = await Gallery.list({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search,
    category: req.query.category,
    featured:
      req.query.featured !== undefined
        ? req.query.featured === "true"
        : undefined
  });

  res.json({
    success: true,
    ...result
  });
});

export const getGallery = asyncHandler(async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);

  if (!gallery) {
    return res.status(404).json({
      success: false,
      message: "Gallery item not found"
    });
  }

  res.json({
    success: true,
    data: gallery
  });
});

export const createGallery = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.image = `/uploads/gallery/${req.file.filename}`;
  }

  const gallery = await Gallery.create(body);

  res.status(201).json({
    success: true,
    data: gallery
  });
});

export const updateGallery = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.image = `/uploads/gallery/${req.file.filename}`;
  }

  const gallery = await Gallery.update(req.params.id, body);

  if (!gallery) {
    return res.status(404).json({
      success: false,
      message: "Gallery item not found"
    });
  }

  res.json({
    success: true,
    data: gallery
  });
});

export const deleteGallery = asyncHandler(async (req, res) => {
  await Gallery.delete(req.params.id);

  res.json({
    success: true,
    message: "Gallery item deleted"
  });
});