import crypto from "crypto";
import UAParser from "ua-parser-js";
import { Visit } from "../models/Visit.js";

const COOKIE_NAME = "visitor_session";
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export function assignSessionCookie(req, res, next) {

  let sessionId = req.cookies?.[COOKIE_NAME];

  if (!sessionId) {

    sessionId = crypto.randomUUID();

    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR
    });

  }

  req.sessionId = sessionId;

  next();

}

export async function recordVisit(req, extra = {}) {

  try {

    const parser = new UAParser(req.headers["user-agent"]);

    const ua = parser.getResult();

    await Visit.create({

      sessionId: req.sessionId,

      ipAddress:
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        req.ip ||
        "",

      page: extra.page || req.originalUrl || "/",

      referrer:
        extra.referrer ||
        req.get("referer") ||
        "",

      browser: ua.browser.name || "",

      deviceType: ua.device.type || "desktop",

      os: ua.os.name || "",

      country: "",

      city: "",

      visitedAt: new Date()

    });

  } catch (err) {

    console.error("Visitor tracking failed:", err.message);

  }

}