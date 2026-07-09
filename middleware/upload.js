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
  ".pdf"
];

function storageFor(folder) {

  const uploadPath = path.join(process.cwd(), "uploads", folder);

  fs.mkdirSync(uploadPath, {
    recursive: true
  });

  return multer.diskStorage({

    destination(req, file, cb) {
      cb(null, uploadPath);
    },

    filename(req, file, cb) {

      const ext = path.extname(file.originalname).toLowerCase();

      cb(
        null,
        `${Date.now()}-${randomUUID()}${ext}`
      );

    }

  });

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
        (Number(process.env.MAX_UPLOAD_MB) || 8) *
        1024 *
        1024

    }

  });