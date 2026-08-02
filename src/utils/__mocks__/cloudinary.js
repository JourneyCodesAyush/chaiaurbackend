import { vi } from "vitest";
import fs from "fs";

export const uploadOnCloudinary = vi
  .fn()
  .mockImplementation(async (localFilePath) => {
    if (!localFilePath) {
      return null;
    }

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      public_id: "fake_id_123",
      secure_url: "https://fake-cloudinary-url.com/avatar.png",
    };
  });

export const deleteOnCloudinary = vi.fn().mockResolvedValue({ result: "ok" });
