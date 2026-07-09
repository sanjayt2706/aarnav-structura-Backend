import { Router } from "express";
import * as ctrl from "../controllers/visitorController.js";
import { requireAuth } from "../middleware/auth.js";

// Public tracking endpoint — mounted at /api/track
export const trackRouter = Router();
trackRouter.post("/pageview", ctrl.trackPageview);

// Admin visitor management — mounted at /api/admin/visitors
export const adminVisitorRouter = Router();
adminVisitorRouter.use(requireAuth);
adminVisitorRouter.get("/", ctrl.listVisitors);
adminVisitorRouter.get("/export/csv", ctrl.exportVisitorsCsv);
adminVisitorRouter.get("/export/excel", ctrl.exportVisitorsExcel);
