import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// console.log("ENV CHECK:", {
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    // Upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log(`Something went wrong trying to upload.`)

    // File has been uploaded successfully
    // console.log(`File has been uploaded successfully on Cloudinary. ${response.url}`);
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    // console.log(`response object:`, response);
    return response;
  } catch (error) {
    console.log("Cloudinary upload failed: ", error);
    // Remove the locally saved temporary file as the upload operation failed
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

const deleteOnCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: `${resourceType}`,
    });
    return result;
  } catch (error) {
    console.log("Cloudinary asset deletion failed: ", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
