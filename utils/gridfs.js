import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { Readable } from "stream";

let bucket;

export const getBucket = () => {
  if (bucket) return bucket;

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection not established. Call connectDB first.");
  }

  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "uploads",
  });

  return bucket;
};

/**
 * Uploads a file buffer to GridFS
 * @param {Buffer} buffer - The file binary data
 * @param {string} filename - Original filename
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - The fileId of the uploaded file
 */
export const uploadToGridFS = async (buffer, filename, contentType) => {
  const bucket = getBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType,
      metadata: { originalName: filename },
    });

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    readableStream.pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => {
        resolve(uploadStream.id.toString());
      });
  });
};

/**
 * Deletes a file from GridFS by ID
 * @param {string} fileId - The GridFS fileId
 */
export const deleteFromGridFS = async (fileId) => {
  if (!fileId) return;
  try {
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch (error) {
    console.error(`GridFS Delete Error [${fileId}]:`, error);
    // We don't throw here to prevent a failed file deletion from breaking a document deletion
  }
};
