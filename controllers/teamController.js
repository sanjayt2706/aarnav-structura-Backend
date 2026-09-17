import { Team } from "../models/Team.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAllMembers = asyncHandler(async (req, res) => {
  const result = await Team.list({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
    search: req.query.search
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

export const getMember = asyncHandler(async (req, res) => {
  const member = await Team.findById(req.params.id);

  if (!member) {
    return res.status(404).json({
      success: false,
      message: "Team member not found"
    });
  }

  res.json({
    success: true,
    data: member
  });
});

export const createMember = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.photo = `/uploads/team/${req.file.filename}`;
  }

  // Harmonize role and designation
  if (body.role && !body.designation) {
    body.designation = body.role;
  } else if (body.designation && !body.role) {
    body.role = body.designation;
  }

  // Harmonize bio and experience
  if (body.bio && !body.experience) {
    body.experience = body.bio;
  } else if (body.experience && !body.bio) {
    body.bio = body.experience;
  }

  // Harmonize linkedin and linkedin_url
  if (body.linkedin_url && !body.linkedin) {
    body.linkedin = body.linkedin_url;
  } else if (body.linkedin && !body.linkedin_url) {
    body.linkedin_url = body.linkedin;
  }

  // Harmonize active and is_active
  if (body.is_active !== undefined) {
    body.is_active =
      body.is_active === true ||
      body.is_active === "true" ||
      body.is_active === 1 ||
      body.is_active === "1";
    body.active = body.is_active;
  } else if (body.active !== undefined) {
    body.active =
      body.active === true ||
      body.active === "true" ||
      body.active === 1 ||
      body.active === "1";
    body.is_active = body.active;
  }

  // Harmonize order and display_order
  if (body.display_order !== undefined) {
    body.display_order = Number(body.display_order) || 0;
    body.order = body.display_order;
  } else if (body.order !== undefined) {
    body.order = Number(body.order) || 0;
    body.display_order = body.order;
  }

  const member = await Team.create(body);

  res.status(201).json({
    success: true,
    data: member
  });
});

export const updateMember = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    body.photo = `/uploads/team/${req.file.filename}`;
  }

  // Harmonize role and designation
  if (body.role && !body.designation) {
    body.designation = body.role;
  } else if (body.designation && !body.role) {
    body.role = body.designation;
  }

  // Harmonize bio and experience
  if (body.bio && !body.experience) {
    body.experience = body.bio;
  } else if (body.experience && !body.bio) {
    body.bio = body.experience;
  }

  // Harmonize linkedin and linkedin_url
  if (body.linkedin_url && !body.linkedin) {
    body.linkedin = body.linkedin_url;
  } else if (body.linkedin && !body.linkedin_url) {
    body.linkedin_url = body.linkedin;
  }

  // Harmonize active and is_active
  if (body.is_active !== undefined) {
    body.is_active =
      body.is_active === true ||
      body.is_active === "true" ||
      body.is_active === 1 ||
      body.is_active === "1";
    body.active = body.is_active;
  } else if (body.active !== undefined) {
    body.active =
      body.active === true ||
      body.active === "true" ||
      body.active === 1 ||
      body.active === "1";
    body.is_active = body.active;
  }

  // Harmonize order and display_order
  if (body.display_order !== undefined) {
    body.display_order = Number(body.display_order) || 0;
    body.order = body.display_order;
  } else if (body.order !== undefined) {
    body.order = Number(body.order) || 0;
    body.display_order = body.order;
  }

  const member = await Team.update(req.params.id, body);

  if (!member) {
    return res.status(404).json({
      success: false,
      message: "Team member not found"
    });
  }

  res.json({
    success: true,
    data: member
  });
});

export const deleteMember = asyncHandler(async (req, res) => {
  await Team.delete(req.params.id);

  res.json({
    success: true,
    message: "Team member deleted"
  });
});