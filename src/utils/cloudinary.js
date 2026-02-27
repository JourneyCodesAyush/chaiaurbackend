import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET_KEY,
});

const uploadFileOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }
        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            "resource_type": "auto"
        });

        // File has been uploaded successfully
        console.log(`File has been uploaded successfully on Cloudinary. ${response.url}`);
        return response;
    } catch (error) {
        // Remove the locally saved temporary file as the upload operation failed
        fs.unlinkSync(localFilePath);

        return null;
    }
};

export { uploadFileOnCloudinary };