import { Project } from "../models/Project.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAllProjects = asyncHandler(async (req, res) => {
  const result = await Project.list({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search,
    category: req.query.category,
    status: req.query.status,
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

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found"
    });
  }

  res.json({
    success: true,
    data: project
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.image = `/uploads/projects/${req.file.filename}`;
  }

  const project = await Project.create(body);

  res.status(201).json({
    success: true,
    data: project
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.image = `/uploads/projects/${req.file.filename}`;
  }

  const project = await Project.update(req.params.id, body);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found"
    });
  }

  res.json({
    success: true,
    data: project
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await Project.delete(req.params.id);

  res.json({
    success: true,
    message: "Project deleted"
  });
});