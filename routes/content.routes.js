import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import { uploadTo } from "../middleware/upload.js";

import * as projectController from "../controllers/projectController.js";
import * as galleryController from "../controllers/galleryController.js";
import * as serviceController from "../controllers/serviceController.js";
import * as teamController from "../controllers/teamController.js";
import * as testimonialController from "../controllers/testimonialController.js";

/* ===========================
   PROJECTS
=========================== */

export const projectsRouter = Router();

projectsRouter.get("/", projectController.getAllProjects);
projectsRouter.get("/:id", projectController.getProject);

projectsRouter.post(
  "/",
  requireAuth,
  uploadTo("projects").single("cover_image"),
  projectController.createProject
);

projectsRouter.put(
  "/:id",
  requireAuth,
  uploadTo("projects").single("cover_image"),
  projectController.updateProject
);

projectsRouter.delete(
  "/:id",
  requireAuth,
  projectController.deleteProject
);

/* ===========================
   GALLERY
=========================== */

export const galleryRouter = Router();

galleryRouter.get("/", galleryController.getAllGallery);
galleryRouter.get("/:id", galleryController.getGallery);

galleryRouter.post(
  "/",
  requireAuth,
  uploadTo("gallery").single("image"),
  galleryController.createGallery
);

galleryRouter.put(
  "/:id",
  requireAuth,
  uploadTo("gallery").single("image"),
  galleryController.updateGallery
);

galleryRouter.delete(
  "/:id",
  requireAuth,
  galleryController.deleteGallery
);

/* ===========================
   SERVICES
=========================== */

export const servicesRouter = Router();

servicesRouter.get("/", serviceController.getAllServices);
servicesRouter.get("/:id", serviceController.getService);

servicesRouter.post(
  "/",
  requireAuth,
  uploadTo("services").single("image"),
  serviceController.createService
);

servicesRouter.put(
  "/:id",
  requireAuth,
  uploadTo("services").single("image"),
  serviceController.updateService
);

servicesRouter.delete(
  "/:id",
  requireAuth,
  serviceController.deleteService
);

/* ===========================
   TEAM
=========================== */

export const teamRouter = Router();

teamRouter.get("/", teamController.getAllMembers);
teamRouter.get("/:id", teamController.getMember);

teamRouter.post(
  "/",
  requireAuth,
  uploadTo("team").single("photo"),
  teamController.createMember
);

teamRouter.put(
  "/:id",
  requireAuth,
  uploadTo("team").single("photo"),
  teamController.updateMember
);

teamRouter.delete(
  "/:id",
  requireAuth,
  teamController.deleteMember
);

/* ===========================
   TESTIMONIALS
=========================== */

export const testimonialsRouter = Router();

testimonialsRouter.get("/", testimonialController.getAllTestimonials);
testimonialsRouter.get("/:id", testimonialController.getTestimonial);

testimonialsRouter.post(
  "/",
  requireAuth,
  uploadTo("testimonials").single("avatar"),
  testimonialController.createTestimonial
);

testimonialsRouter.put(
  "/:id",
  requireAuth,
  uploadTo("testimonials").single("avatar"),
  testimonialController.updateTestimonial
);

testimonialsRouter.delete(
  "/:id",
  requireAuth,
  testimonialController.deleteTestimonial
);