import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/errorHandler.js";
import { Enquiry } from "../models/Enquiry.js";
import { generateResponse, calculateEstimate } from "../services/ai/aiService.js";
import { sendCustomerConfirmation, sendCompanyNotification } from "../utils/mailer.js";

const router = Router();

// Rate limiter for AI consultation (30 requests per 10 minutes)
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many requests. Please try again later or contact our team." }
});

/**
 * POST /api/ai/consult
 * Generates contextual response via backend AI service (Gemini / Knowledge layer)
 */
router.post("/consult", aiLimiter, asyncHandler(async (req, res) => {
  const { message, messages = [] } = req.body;

  // Build list of message history
  let conversationHistory = Array.isArray(messages) && messages.length > 0 ? [...messages] : [];
  if (message && typeof message === "string" && message.trim()) {
    conversationHistory.push({ sender: "user", text: message.trim() });
  }

  if (conversationHistory.length === 0) {
    return res.status(400).json({ success: false, message: "A message is required." });
  }

  const result = await generateResponse({ messages: conversationHistory });

  return res.json({
    success: true,
    reply: result.reply
  });
}));

/**
 * POST /api/ai/estimate
 * Calculates preliminary construction cost using actual knowledge base rates
 */
router.post("/estimate", aiLimiter, asyncHandler(async (req, res) => {
  const { area, floors, packageTier } = req.body;
  const result = calculateEstimate({ area, floors, packageTier });

  return res.json({
    success: true,
    data: result
  });
}));

/**
 * POST /api/ai/handoff
 * Creates project enquiry using EXISTING Enquiry backend model
 */
router.post("/handoff", aiLimiter, asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, email, location, projectType, budget, conversationSummary } = req.body;

  if (!fullName || !phoneNumber) {
    return res.status(400).json({ success: false, message: "Full name and phone number are required." });
  }

  const brief = `[Project Assistant Enquiry]\n` +
    `Summary: ${conversationSummary || "Direct request from Project Assistant"}`;

  const enquiry = await Enquiry.create({
    fullName,
    phoneNumber,
    email: email || "",
    location: location || "Karnataka",
    projectType: projectType || "Residential construction",
    budget: budget || "Custom Estimate",
    projectBrief: brief,
    source: "ai_assistant"
  }, req.ip);

  // Send background notifications
  Promise.all([
    sendCustomerConfirmation(enquiry),
    sendCompanyNotification(enquiry)
  ]).catch((err) => {
    console.error("Enquiry notification email error:", err.message);
  });

  return res.status(201).json({
    success: true,
    message: "Project enquiry submitted successfully. Our engineering team will contact you.",
    enquiryId: enquiry._id
  });
}));

export default router;
