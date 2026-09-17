import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const ALLOWED = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".mp4",
  ".webm",
  ".mov",
  ".mkv",
  ".ogg",
  ".doc",
  ".docx",
  ".dwg"
];

function storageFor(folder) {
  return multer.memoryStorage();
}

function fileFilter(req, file, cb) {

  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED.includes(ext)) {

    return cb(
      new Error(`Unsupported file type: ${ext}`)
    );

  }

  cb(null, true);

}

export const uploadTo = (folder) =>

  multer({

    storage: storageFor(folder),

    fileFilter,

    limits: {

      fileSize:
        (Number(process.env.MAX_UPLOAD_MB) || 50) *
        1024 *
        1024

    }

  });
