import { Enquiry } from "../models/Enquiry.js";
import { Admin } from "../models/Admin.js";
import { asyncHandler, checkValidation } from "../middleware/errorHandler.js";
import {
  sendCustomerConfirmation,
  sendCompanyNotification
} from "../utils/mailer.js";
import { toCsv, toExcelBuffer } from "../utils/exporter.js";

// ---------- Public ----------

export const submitEnquiry = asyncHandler(async (req, res) => {
  if (checkValidation(req, res)) return;

  const enquiry = await Enquiry.create(req.body, req.ip);

  // Send emails in background
  sendCustomerConfirmation(enquiry).catch(console.error);
  sendCompanyNotification(enquiry).catch(console.error);

  res.status(201).json({
    success: true,
    message: "Enquiry received successfully",
    data: {
      id: enquiry._id
    }
  });
});

// ---------- Admin ----------

export const listEnquiries = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    status,
    projectType,
    dateFrom,
    dateTo,
    sortBy,
    sortDir
  } = req.query;

  const result = await Enquiry.list({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    search,
    status,
    projectType,
    dateFrom,
    dateTo,
    sortBy,
    sortDir
  });

  res.json({
    success: true,
    ...result
  });
});

export const getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      message: "Enquiry not found"
    });
  }

  res.json({
    success: true,
    data: enquiry
  });
});

export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  if (status && !Enquiry.STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status"
    });
  }

  const updated = await Enquiry.updateStatus(
    req.params.id,
    status,
    adminNotes
  );

  await Admin.logActivity({
    adminId: req.admin.id,
    action: "enquiry.update_status",
    entityType: "enquiry",
    entityId: req.params.id,
    details: {
      status
    },
    ip: req.ip
  });

  res.json({
    success: true,
    data: updated
  });
});

export const deleteEnquiry = asyncHandler(async (req, res) => {
  await Enquiry.delete(req.params.id);

  await Admin.logActivity({
    adminId: req.admin.id,
    action: "enquiry.delete",
    entityType: "enquiry",
    entityId: req.params.id,
    ip: req.ip
  });

  res.json({
    success: true,
    message: "Enquiry deleted successfully"
  });
});

export const bulkDeleteEnquiries = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const count = await Enquiry.bulkDelete(ids || []);

  res.json({
    success: true,
    message: `${count} enquiries deleted`
  });
});

export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;

  if (!Enquiry.STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status"
    });
  }

  const count = await Enquiry.bulkUpdateStatus(
    ids || [],
    status
  );

  res.json({
    success: true,
    message: `${count} enquiries updated`
  });
});

/* ----------------------------
   Export
----------------------------- */

const EXPORT_COLUMNS = [
  { key: "_id", label: "ID" },
  { key: "fullName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "projectType", label: "Project Type" },
  { key: "budget", label: "Budget" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Received" }
];

export const exportEnquiriesCsv = asyncHandler(async (req, res) => {
  const rows = await Enquiry.listAll(req.query);

  const csv = toCsv(
    rows,
    EXPORT_COLUMNS.map(c => c.key)
  );

  res.header("Content-Type", "text/csv");
  res.attachment(`enquiries-${Date.now()}.csv`);
  res.send(csv);
});

export const exportEnquiriesExcel = asyncHandler(async (req, res) => {
  const rows = await Enquiry.listAll(req.query);

  const buffer = await toExcelBuffer(
    rows,
    EXPORT_COLUMNS,
    "Enquiries"
  );

  res.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.attachment(`enquiries-${Date.now()}.xlsx`);
  res.send(buffer);
});