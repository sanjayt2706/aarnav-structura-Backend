import { Service } from "../models/Service.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAllServices = asyncHandler(async (req, res) => {
  const result = await Service.list({
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

export const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found"
    });
  }

  res.json({
    success: true,
    data: service
  });
});

export const createService = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.image = `/uploads/services/${req.file.filename}`;
  }

  const service = await Service.create(body);

  res.status(201).json({
    success: true,
    data: service
  });
});

export const updateService = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.image = `/uploads/services/${req.file.filename}`;
  }

  const service = await Service.update(req.params.id, body);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found"
    });
  }

  res.json({
    success: true,
    data: service
  });
});

export const deleteService = asyncHandler(async (req, res) => {
  await Service.delete(req.params.id);

  res.json({
    success: true,
    message: "Service deleted"
  });
});