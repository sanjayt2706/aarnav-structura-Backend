import express from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getBucket } from "../utils/gridfs.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/:id", asyncHandler(async (req, res) => {
  const fileId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file ID format"
    });
  }

  const bucket = getBucket();

  try {
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    const file = files[0];

    // Set content type from GridFS metadata or default to octet-stream
    const contentType = file.contentType || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("GridFS Stream Error:", err);
      if (!res.headersSent) {
        res.status(500).send("Error streaming file");
      }
    });

  } catch (error) {
    console.error("GridFS Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching file"
    });
  }
}));

export default router;
