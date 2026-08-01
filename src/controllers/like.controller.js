import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video Id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  let doc = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  let newLikeStatus = false;

  if (doc) {
    await Like.findOneAndDelete({
      video: videoId,
      likedBy: userId,
    });
    newLikeStatus = false;
  } else {
    await Like.create({
      video: videoId,
      likedBy: userId,
    });
    newLikeStatus = true;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likedStatus: newLikeStatus },
        "Like toggled successfully"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment Id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  let doc = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  let newLikeStatus = false;

  if (doc) {
    await Like.findOneAndDelete({
      comment: commentId,
      likedBy: userId,
    });
    newLikeStatus = false;
  } else {
    await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    newLikeStatus = true;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likedStatus: newLikeStatus },
        "Like toggled successfully"
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet Id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  let doc = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  let newLikeStatus = false;

  if (doc) {
    await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: userId,
    });
    newLikeStatus = false;
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    newLikeStatus = true;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likedStatus: newLikeStatus },
        "Like toggled successfully"
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  const videos = await Like.aggregate([
    {
      $match: {
        likedBy: userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $match: {
        "video.isPublished": true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        _id: "$video._id",
        title: "$video.title",
        description: "$video.description",
        views: "$video.views",
        duration: "$video.duration",
        thumbNail: "$video.thumbNail",
        owner: "$owner",
        createdAt: "$video.createdAt",
      },
    },
  ]);

  if (!videos.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No liked videos found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
