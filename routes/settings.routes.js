import { Router } from "express";
import * as ctrl from "../controllers/settingsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

// Public — mounted at /api/settings
export const publicSettingsRouter = Router();
publicSettingsRouter.get("/", ctrl.getAllSettings);
publicSettingsRouter.get("/:key", ctrl.getSetting);

// Admin — mounted at /api/admin/settings
export const adminSettingsRouter = Router();
adminSettingsRouter.use(requireAuth, requireRole("super_admin", "admin"));
adminSettingsRouter.put("/:key", ctrl.upsertSetting);
