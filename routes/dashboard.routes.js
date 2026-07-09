import { Router } from "express";
import * as ctrl from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/overview", ctrl.getOverview);
router.get("/charts", ctrl.getCharts);

export default router;
