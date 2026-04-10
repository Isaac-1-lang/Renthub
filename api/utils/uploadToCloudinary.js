import { v2 as cloudinary } from "cloudinary";
import { configDotenv } from "dotenv";
import fs from "fs";

configDotenv();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file path to Cloudinary.
 * Cleans up the temp file after upload regardless of OS.
 * Returns the secure HTTPS URL.
 */
export const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "renthub",
            resource_type: "image",
        });
        return result.secure_url;
    } finally {
        // always clean up the temp file, even if upload fails
        try { fs.unlinkSync(filePath); } catch (_) {}
    }
};
