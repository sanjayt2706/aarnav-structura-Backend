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
// import { projectsRouter, galleryRouter, servicesRouter, testimonialsRouter, teamRouter } from "./routes/content.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Render (and most PaaS hosts) put the app behind a reverse proxy, so
// req.ip / X-Forwarded-For need this to be trusted — otherwise
// express-rate-limit throws on every rate-limited request (e.g. POST /api/enquiry).
app.set("trust proxy", true);

// ---------- Core middleware ----------
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // allow uploaded images to be fetched cross-origin by the frontend
app.use(cors({ origin: [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean), credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Serve uploaded files (project images, gallery, brochures, avatars)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// ---------- Public routes ----------
app.use("/api", enquiryRoutes);              // POST /api/enquiry
app.use("/api/track", trackRouter);           // POST /api/track/pageview
app.use("/api/settings", publicSettingsRouter);
// app.use("/api/projects", projectsRouter);
// app.use("/api/gallery", galleryRouter);
// app.use("/api/services", servicesRouter);
// app.use("/api/testimonials", testimonialsRouter);
// app.use("/api/team", teamRouter);

// ---------- Auth ----------
app.use("/api/auth", authRoutes);

// ---------- Admin-only routes ----------
app.use("/api/admin/enquiries", adminEnquiryRoutes);
app.use("/api/admin/visitors", adminVisitorRouter);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/settings", adminSettingsRouter);
// Note: projects/gallery/services/testimonials/team admin writes (POST/PUT/DELETE)
// are already protected by requireAuth inside content.routes.js and share the
// same /api/<resource> paths as the public GETs above.

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
  console.error("========== SERVER ERROR ==========");
  console.error(err);
  console.error(err.stack);
  process.exit(1);
}
};
console.log("===== BACKEND VERSION 2 =====");
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("MAIL_FROM:", process.env.MAIL_FROM);
startServer();