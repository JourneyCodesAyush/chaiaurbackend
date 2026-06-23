import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const pipeline = [];

  if (query?.trim()) {
    const searchQuery = query?.trim();
    pipeline.push({
      $match: {
        $or: [
          {
            title: {
              $regex: searchQuery,
              $options: "i",
            },
          },
          {
            description: {
              $regex: searchQuery,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  const matchStage = {
    isPublished: true,
  };

  if (userId) {
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  pipeline.push({ $match: matchStage });

  const allowedSortFields = ["duration", "createdAt", "title", "views"];

  if (sortBy && allowedSortFields.includes(sortBy)) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              _id: 0,
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails",
    }
  );

  const videoAggregate = Video.aggregate(pipeline);

  const options = {
    page: Math.max(1, Number(page) || 1),
    limit: Math.min(50, Math.max(1, Number(limit) || 10)),
  };

  const video = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
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

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId), // String to ObjectId conversion
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user._id, "$subscribers.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              "avatar.url": 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        "videoFile.url": 1,
        title: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        comments: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (!video.length) throw new ApiError(404, "Video does not exist");

  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { watchHistory: videoId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  // Validate video id
  // Validate if all fields are present
  // Upload new thumbnail on cloudinary
  // Update on mongoDB
  // Delete old thumbnail from cloudinary

  const { title, description } = req.body;

  if (!videoId) throw new ApiError(400, "Video id is required");

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  if ([title, description].some((field) => field?.trim() === ""))
    throw new ApiError(400, "All fields are required");

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

  const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!newThumbnail) throw new ApiError(500, "Thumbnail upload failed");

  const oldVideoDoc = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!oldVideoDoc) throw new ApiError(404, "Video not found");

  const updatedVideo = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user._id,
    },
    {
      $set: {
        title: title,
        description: description,
        thumbNail: {
          public_id: newThumbnail.public_id,
          url: newThumbnail.secure_url,
        },
      },
    },
    { new: true } // Return the updated document
  );

  if (!updatedVideo) throw new ApiError(500, "Failed to update video details");

  await deleteOnCloudinary(oldVideoDoc.thumbNail.public_id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Updated video successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  // Validate videoId
  // Delete video
  // Delete video file and thumbnail from cloudinary
  // Delete likes associated with the video
  // Delete comments associated with the video

  if (!videoId) throw new ApiError(400, "Video id is required");

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) throw new ApiError(404, "Video not found");

  await deleteOnCloudinary(video.thumbNail.public_id);
  await deleteOnCloudinary(video.videoFile.public_id, "video");

  await Like.deleteMany({
    video: videoId,
  });

  await Comment.deleteMany({
    video: videoId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Validate videoId
  // Get video from MongoDB and toggle status (single call)

  if (!videoId) throw new ApiError(400, "Video id is required");

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video does not exist");

  video.isPublished = !video.isPublished;

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Toggle publish status successful"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
