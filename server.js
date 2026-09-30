import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import logger from "./config/logger.js";
import { connectDB } from "./config/db.js";
import { assignSessionCookie, recordVisit } from "./middleware/visitorTracker.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import enquiryRoutes, { adminEnquiryRoutes } from "./routes/enquiry.routes.js";
import { trackRouter, adminVisitorRouter } from "./routes/visitor.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { publicSettingsRouter, adminSettingsRouter } from "./routes/settings.routes.js";
import { projectsRouter, galleryRouter, servicesRouter, testimonialsRouter, teamRouter } from "./routes/content.routes.js";
import filesRouter from "./routes/files.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Render (and most PaaS hosts) put the app behind a reverse proxy, so
// req.ip / X-Forwarded-For need this to be trusted — otherwise
// express-rate-limit throws on every rate-limited request (e.g. POST /api/enquiry).
app.set("trust proxy", 1);

// ---------- Core middleware ----------
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // allow uploaded images to be fetched cross-origin by the frontend

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        (process.env.ALLOWED_DOMAINS && process.env.ALLOWED_DOMAINS.split(",").some((d) => origin.includes(d.trim())))
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"), false);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Serve files from GridFS
app.use("/api/files", filesRouter);


// Visitor tracking: assign a session cookie to every request, then log the
// initial page hit for classic (non-SPA) requests. SPA route changes are
// tracked explicitly via POST /api/track/pageview from the React app.
app.use(assignSessionCookie);
app.get("/", (req, res, next) => {
  recordVisit(req, { page: "/" }).catch(() => {});
  next();
});

// ---------- Health check ----------
app.get("/api/health", (req, res) => res.json({ success: true, message: "API is running", time: new Date().toISOString() }));

import aiRoutes from "./routes/ai.routes.js";

// ---------- Public routes ----------
app.use("/api", enquiryRoutes);              // POST /api/enquiry
app.use("/api/ai", aiRoutes);                // POST /api/ai/consult & /api/ai/handoff
app.use("/api/track", trackRouter);           // POST /api/track/pageview
app.use("/api/settings", publicSettingsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/services", servicesRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/team", teamRouter);

// ---------- Auth ----------
app.use("/api/auth", authRoutes);

// ---------- Admin-only routes ----------
app.use("/api/admin/enquiries", adminEnquiryRoutes);
app.use("/api/admin/visitors", adminVisitorRouter);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/settings", adminSettingsRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(
        `🚀 Aarnav Structura API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`
      );
    });

  } catch (err) {
    logger.error("========== SERVER ERROR ==========");
    logger.error(err.stack || err.message);
    process.exit(1);
  }
};

startServer();