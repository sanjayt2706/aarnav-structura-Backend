import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../../config/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(__dirname, "../../knowledge");

// Load Knowledge Base
let companyData = {};
let servicesData = [];
let estimatorData = {};
let processData = [];

try {
  companyData = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, "company.json"), "utf8"));
  servicesData = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, "services.json"), "utf8"));
  estimatorData = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, "estimator.json"), "utf8"));
  processData = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, "process.json"), "utf8"));
} catch (err) {
  logger.warn("Could not load knowledge files:", err.message);
}

// System Prompt for Aarnav Structura Project Consultant
const SYSTEM_INSTRUCTION = `
You are the "Aarnav Structura Project Consultant", representing Aarnav Structura, a civil engineering, architectural design, and construction firm in Shivamogga, Karnataka.

PERSONALITY & BEHAVIOR RULES:
1. Professional, mature, calm, concise, knowledgeable, honest, and helpful.
2. Conversational tone without being robotic.
3. DO NOT use emojis unless the user uses them first and the context calls for it.
4. DO NOT use repetitive AI filler phrases like "Certainly!", "Absolutely!", "Great question!", or "I'd be delighted to help!".
5. You represent the company as a digital project consultant. Do not pretend to be a licensed human engineer.
6. If a query requires physical site inspection, licensed architectural stamp, or official SUDA/BBMP sanction, clearly explain that you provide preliminary consultation, and final verification will be handled by our licensed engineering team.
7. FACTUAL ACCURACY: Strictly rely on the verified Aarnav Structura knowledge base provided below. Do not invent pricing, licenses, or fake statistics. If you don't know something, state: "I don't have enough information to give you a reliable figure for that. I can help you prepare your project details for the Aarnav Structura engineering team."

VERIFIED AARNAV STRUCTURA KNOWLEDGE:
Company Info: ${JSON.stringify(companyData)}
Services: ${JSON.stringify(servicesData)}
Construction Rates & Estimator: ${JSON.stringify(estimatorData)}
Process Workflow: ${JSON.stringify(processData)}

COST ESTIMATION GUIDE:
- Standard RCC Construction: ₹1,750/sq.ft
- Premium Turnkey Construction: ₹2,150/sq.ft
- Luxury Architectural Villa: ₹2,750/sq.ft
When providing cost figures, present them as an indicative range based on these rates, followed by the disclaimer:
"Indicative estimate. Final pricing depends on site conditions, structural requirements, specifications and material selection."

RESPONSE STRUCTURE:
- Provide clear, well-structured answers (use bullet points or concise paragraphs for multi-part questions).
- Ask one relevant follow-up question when useful to help narrow down the user's project requirements (e.g. plot area, floor plan, location in Karnataka).
`;

/**
 * Calculate indicative construction cost
 */
export function calculateEstimate({ area, floors = "G+1", packageTier = "premium" }) {
  const areaNum = Number(area) || 1500;
  const multiplier = floors === "Ground Floor" ? 1 : floors === "G+1" ? 1.9 : 2.8;
  const builtUp = Math.round(areaNum * multiplier);
  
  const pkg = estimatorData.packages?.find((p) => p.id === packageTier) || estimatorData.packages?.[1] || { ratePerSqFt: 2150 };
  const cost = builtUp * pkg.ratePerSqFt;

  return {
    area: areaNum,
    floors,
    builtUp,
    ratePerSqFt: pkg.ratePerSqFt,
    packageName: pkg.name,
    estimatedCost: cost,
    disclaimer: estimatorData.disclaimer || "Indicative estimate. Final pricing depends on site conditions, drawings, specifications and material selection."
  };
}

/**
 * Core AI Response Generation Abstraction
 */
export async function generateResponse({ messages = [] }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  // If no API key configured, use intelligent rule-based knowledge fallback
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY / AI_API_KEY not configured in backend environment variables. Using internal knowledge fallback.");
    return generateFallbackResponse(messages);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.AI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // Format chat history for Gemini SDK
    // Filter history to last 10 messages to maintain a reasonable context window
    const recentMessages = messages.slice(-10);
    const contents = recentMessages.map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const result = await model.generateContent({ contents });
    const replyText = result.response.text();

    return {
      success: true,
      reply: replyText.trim()
    };
  } catch (err) {
    logger.error("AI API Call Failed:", err.message);
    return {
      success: true,
      reply: "I'm having trouble retrieving full details right now. You can calculate a preliminary estimate using our Cost Estimator tool above, or leave your contact details so our engineering desk can get in touch with you directly."
    };
  }
}

/**
 * Fallback knowledge handler when API key is unconfigured or offline
 */
function generateFallbackResponse(messages) {
  const lastMsg = messages[messages.length - 1]?.text || "";
  const q = lastMsg.toLowerCase();

  let reply = "Hello. I am the Aarnav Structura Project Consultant. I can help you understand our civil engineering services, estimate project costs, and connect you with our engineering desk in Shivamogga.";

  if (q.includes("cost") || q.includes("price") || q.includes("rate") || q.includes("sq ft") || q.includes("sqft") || q.includes("budget") || q.includes("estimate")) {
    reply = `Our preliminary turnkey construction estimates in Karnataka range from:\n• Standard RCC Construction: ₹1,750/sq.ft\n• Premium Turnkey Specification: ₹2,150/sq.ft\n• Luxury Architectural Build: ₹2,750/sq.ft\n\nIndicative estimate. Final pricing depends on site conditions, structural requirements, specifications and material selection.\n\nApproximately how many square feet of built-up area are you planning?`;
  } else if (q.includes("approval") || q.includes("suda") || q.includes("bbmp") || q.includes("plan") || q.includes("sanction")) {
    reply = "We handle statutory approvals for projects in Karnataka, including SUDA (Shivamogga Urban Development Authority), BBMP, BDA, and DTCP sanction drawings, setback verifications, and structural stability certifications.\n\nWhere is your plot located?";
  } else if (q.includes("service") || q.includes("work") || q.includes("offer")) {
    reply = "Aarnav Structura provides six main engineering disciplines:\n1. Architectural Planning & Sanctions\n2. Structural RCC & Soil Engineering\n3. Turnkey Residential Construction\n4. Commercial Fit-Outs\n5. Project Management Consultancy (PMC)\n6. Structural Strengthening & Retrofitting\n\nWhich service aligns best with your current project needs?";
  } else if (q.includes("visit") || q.includes("contact") || q.includes("engineer") || q.includes("human") || q.includes("call")) {
    reply = "We can arrange an on-site technical inspection with our engineering team in Shivamogga, Bengaluru, or surrounding Karnataka districts. Would you like me to prepare a callback request for our team?";
  }

  return {
    success: true,
    reply
  };
}
