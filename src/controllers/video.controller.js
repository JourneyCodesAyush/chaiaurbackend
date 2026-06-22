import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  // Check if details are valid
  // Check for video and thumbnail
  // Upload them to cloudinary
  // Create Video object, create entry in DB
  // Return the document as data

  if ([title, description].some((field) => field?.trim() === ""))
    throw new ApiError(400, "All fields are required");

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  const videoLocalPath = req.files?.videoFile[0]?.path;

  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");
  if (!videoLocalPath) throw new ApiError(400, "Video is required");

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const video = await uploadOnCloudinary(videoLocalPath);

  if (!thumbnail) throw new ApiError(500, "Thumbnail upload failed");
  if (!video) throw new ApiError(500, "Video upload failed");

  const uploadedVideo = await Video.create({
    videoFile: {
      public_id: video.public_id,
      url: video.secure_url,
    },
    thumbNail: {
      public_id: thumbnail.public_id,
      url: thumbnail.secure_url,
    },
    title: title,
    description: description,
    duration: video.duration,
    views: 0,
    isPublished: false,
    owner: req.user?._id, // User has to exist, but still :)
  });

  if (!uploadedVideo) throw new ApiError(500, "Video upload failed");

  return res
    .status(201)
    .json(new ApiResponse(201, uploadedVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  // Verify if videoId is valid
  // Get the document from MongoDB
  // Check if document exists
  // Return the document with response

  if (!videoId) throw new ApiError(400, "Video id is required");

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user?._id,
  });

  if (!video) throw new ApiError(404, "Video does not exist");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
