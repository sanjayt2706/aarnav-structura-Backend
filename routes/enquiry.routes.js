import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import * as ctrl from "../controllers/enquiryController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Prevent spam-submission of the public contact form.
const submitLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: "Too many submissions, please try again later." } });

// ---------- Public ----------
router.post(
  "/enquiry",
  submitLimiter,
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
    body("email").optional({ checkFalsy: true }).isEmail().withMessage("Invalid email")
  ],
  ctrl.submitEnquiry
);

// ---------- Admin ----------
const admin = Router();
admin.use(requireAuth);
admin.get("/", ctrl.listEnquiries);
admin.get("/export/csv", ctrl.exportEnquiriesCsv);
admin.get("/export/excel", ctrl.exportEnquiriesExcel);
admin.delete("/bulk", ctrl.bulkDeleteEnquiries);
admin.patch("/bulk/status", ctrl.bulkUpdateStatus);
admin.get("/:id", ctrl.getEnquiry);
admin.patch("/:id/status", ctrl.updateEnquiryStatus);
admin.delete("/:id", ctrl.deleteEnquiry);

export default router;
export { admin as adminEnquiryRoutes };
