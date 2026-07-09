import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post(
  "/login",
  [body("email").isEmail().withMessage("Valid email required"), body("password").notEmpty().withMessage("Password required")],
  authController.login
);

router.get("/me", requireAuth, authController.me);
router.post("/logout", requireAuth, authController.logout);

router.post(
  "/change-password",
  requireAuth,
  [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters")],
  authController.changePassword
);

router.post("/forgot-password", [body("email").isEmail()], authController.forgotPassword);
router.post(
  "/reset-password",
  [body("token").notEmpty(), body("newPassword").isLength({ min: 8 })],
  authController.resetPassword
);

export default router;
