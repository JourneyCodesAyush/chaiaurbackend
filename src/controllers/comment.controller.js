import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        $from: "users",
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
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  const options = {
    page: Math.max(1, Number(page) || 1),
    limit: Math.max(50, Number(limit) || 50),
  };

  const comments = Comment.aggregatePaginate(commentsAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const userId = req?.user?._id;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  if (!userId) throw new ApiError(401, "Unauthorized action");

  const { content } = req.body;
  if (!content) throw new ApiError(400, "Comment body cannot be empty");

  const doc = await Comment.create({
    owner: userId,
    video: videoId,
    content: content,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, doc, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  if (!content) throw new ApiError(400, "Comment cannot be empty");

  const doc = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: userId,
    },
    {
      $set: { content: content },
    },
    { returnDocument: "after" }
  );

  if (doc) {
    return res
      .status(200)
      .json(new ApiResponse(200, doc, "Comment updated successfully"));
  }
  throw new ApiError(404, "No such comment found");
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  let doc = await Comment.findOneAndDelete({
    _id: commentId,
    owner: userId,
  });

  if (doc) {
    return res
      .status(200)
      .json(new ApiResponse(200, doc, "Comment deleted successfully"));
  }
  throw new ApiError(404, "No such comment found");
});

export { getVideoComments, addComment, updateComment, deleteComment };
