import { Project } from "../models/Project.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { uploadToGridFS, deleteFromGridFS } from "../utils/gridfs.js";

export const getAllProjects = asyncHandler(async (req, res) => {
  const result = await Project.list({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
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
    data: result.rows,
    rows: result.rows,
    total: result.total,
    page: result.page,
    limit: result.limit
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

  if (req.files) {
    // Cover image
    if (req.files['cover_image'] && req.files['cover_image'].length > 0) {
      const file = req.files['cover_image'][0];
      const fileId = await uploadToGridFS(file.buffer, file.originalname, file.mimetype);
      body.image = fileId;
      body.cover_image = fileId;
    }

    // Media files (Photos & Videos)
    if (req.files['media_files'] && req.files['media_files'].length > 0) {
      body.media = await Promise.all(req.files['media_files'].map(async (file) => {
        const fileId = await uploadToGridFS(file.buffer, file.originalname, file.mimetype);
        return {
          url: fileId,
          type: file.mimetype.startsWith('video/') ? 'video' : 'image',
          name: file.originalname
        };
      }));
    }

    // Document files
    if (req.files['document_files'] && req.files['document_files'].length > 0) {
      body.documents = await Promise.all(req.files['document_files'].map(async (file) => {
        const fileId = await uploadToGridFS(file.buffer, file.originalname, file.mimetype);
        return {
          name: file.originalname,
          url: fileId,
          size: `${(file.size / 1024).toFixed(2)} KB`
        };
      }));
    }
  }

  if (body.is_featured !== undefined) {
    body.is_featured =
      body.is_featured === true ||
      body.is_featured === "true" ||
      body.is_featured === 1 ||
      body.is_featured === "1";
    body.featured = body.is_featured;
  } else if (body.featured !== undefined) {
    body.featured =
      body.featured === true ||
      body.featured === "true" ||
      body.featured === 1 ||
      body.featured === "1";
    body.is_featured = body.featured;
  }

  if (body.display_order !== undefined) {
    body.display_order = Number(body.display_order) || 0;
  }

  const project = await Project.create(body);

  res.status(201).json({
    success: true,
    data: project
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.files) {
    // Cover image
    if (req.files['cover_image'] && req.files['cover_image'].length > 0) {
      const file = req.files['cover_image'][0];
      const fileId = await uploadToGridFS(file.buffer, file.originalname, file.mimetype);
      body.image = fileId;
      body.cover_image = fileId;
    }

    // Media files (Photos & Videos)
    if (req.files['media_files'] && req.files['media_files'].length > 0) {
      body.media = await Promise.all(req.files['media_files'].map(async (file) => {
        const fileId = await uploadToGridFS(file.buffer, file.originalname, file.mimetype);
        return {
          url: fileId,
          type: file.mimetype.startsWith('video/') ? 'video' : 'image',
          name: file.originalname
        };
      }));
    }

    // Document files
    if (req.files['document_files'] && req.files['document_files'].length > 0) {
      body.documents = await Promise.all(req.files['document_files'].map(async (file) => {
        const fileId = await uploadToGridFS(file.buffer, file.originalname, file.mimetype);
        return {
          name: file.originalname,
          url: fileId,
          size: `${(file.size / 1024).toFixed(2)} KB`
        };
      }));
    }
  }

  if (body.is_featured !== undefined) {
    body.is_featured =
      body.is_featured === true ||
      body.is_featured === "true" ||
      body.is_featured === 1 ||
      body.is_featured === "1";
    body.featured = body.is_featured;
  } else if (body.featured !== undefined) {
    body.featured =
      body.featured === true ||
      body.featured === "true" ||
      body.featured === 1 ||
      body.featured === "1";
    body.is_featured = body.featured;
  }

  if (body.display_order !== undefined) {
    body.display_order = Number(body.display_order) || 0;
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
  const project = await Project.findById(req.params.id);
  if (project) {
    if (project.image) await deleteFromGridFS(project.image);
    if (project.cover_image) await deleteFromGridFS(project.cover_image);
    if (project.media) await Promise.all(project.media.map(m => deleteFromGridFS(m.url)));
    if (project.documents) await Promise.all(project.documents.map(d => deleteFromGridFS(d.url)));
  }
  await Project.delete(req.params.id);

  res.json({
    success: true,
    message: "Project deleted"
  });
});