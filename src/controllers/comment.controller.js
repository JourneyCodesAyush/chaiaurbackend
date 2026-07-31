import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
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
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
