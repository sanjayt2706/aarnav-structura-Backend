import { Visit } from "../models/Visit.js";
import { recordVisit } from "../middleware/visitorTracker.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { toCsv, toExcelBuffer } from "../utils/exporter.js";

// POST /api/track/pageview
export const trackPageview = asyncHandler(async (req, res) => {
  await recordVisit(req, {
    page: req.body.page,
    referrer: req.body.referrer
  });

  res.json({
    success: true
  });
});

export const listVisitors = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    country,
    device,
    browser,
    dateFrom,
    dateTo
  } = req.query;

  const result = await Visit.list({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    search,
    country,
    device,
    browser,
    dateFrom,
    dateTo
  });

  res.json({
    success: true,
    ...result
  });
});

const EXPORT_COLUMNS = [
  { key: "_id", label: "ID" },
  { key: "ipAddress", label: "IP" },
  { key: "country", label: "Country" },
  { key: "city", label: "City" },
  { key: "browser", label: "Browser" },
  { key: "deviceType", label: "Device" },
  { key: "os", label: "OS" },
  { key: "page", label: "Page" },
  { key: "visitedAt", label: "Visited At" }
];

export const exportVisitorsCsv = asyncHandler(async (req, res) => {
  const rows = await Visit.listAll(req.query);

  const csv = toCsv(
    rows,
    EXPORT_COLUMNS.map(c => c.key)
  );

  res.header("Content-Type", "text/csv");
  res.attachment(`visitors-${Date.now()}.csv`);
  res.send(csv);
});

export const exportVisitorsExcel = asyncHandler(async (req, res) => {
  const rows = await Visit.listAll(req.query);

  const buffer = await toExcelBuffer(
    rows,
    EXPORT_COLUMNS,
    "Visitors"
  );

  res.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.attachment(`visitors-${Date.now()}.xlsx`);

  res.send(buffer);
});