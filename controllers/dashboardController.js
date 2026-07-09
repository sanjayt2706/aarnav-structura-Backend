import { Visit } from "../models/Visit.js";
import { Enquiry } from "../models/Enquiry.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getOverview = asyncHandler(async (req, res) => {
  const [visitStats, enquiryStats] = await Promise.all([
    Visit.stats(),
    Enquiry.stats()
  ]);

  res.json({
    success: true,
    data: {
      cards: {
        totalVisitors: visitStats.total,
        visitorsToday: visitStats.today,
        visitorsThisWeek: visitStats.thisWeek,
        visitorsThisMonth: visitStats.thisMonth,

        totalEnquiries: enquiryStats.total,
        enquiriesToday: enquiryStats.today,
        pendingEnquiries: enquiryStats.pending,
        completedEnquiries: enquiryStats.completed,
        conversionRate: enquiryStats.conversionRate
      }
    }
  });
});

export const getCharts = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;

  const [
    visitorTrend,
    enquiryTrend,
    traffic,
    devices,
    browsers
  ] = await Promise.all([
    Visit.dailyTrend(days),
    Enquiry.trend(days),

    Visit.breakdown("referrer", 8),
    Visit.breakdown("deviceType", 6), // MongoDB field
    Visit.breakdown("browser", 8)
  ]);

  const dateMap = {};

  visitorTrend.forEach(v => {
    dateMap[v.date] = {
      date: v.date,
      visitors: v.count,
      enquiries: 0
    };
  });

  enquiryTrend.forEach(e => {
    if (!dateMap[e.date]) {
      dateMap[e.date] = {
        date: e.date,
        visitors: 0,
        enquiries: 0
      };
    }

    dateMap[e.date].enquiries = e.count;
  });

  const combined = Object.values(dateMap).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  res.json({
    success: true,
    data: {
      dailyVisitors: visitorTrend,
      enquiryTrend,
      visitorVsEnquiry: combined,

      trafficSources: traffic,
      deviceDistribution: devices,
      browserDistribution: browsers
    }
  });
});