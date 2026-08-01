import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized action");

  const { content } = req.body;
  if (!content) throw new ApiError(400, "Tweet body cannot be empty");

  const doc = await Tweet.create({
    owner: userId,
    content: content,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, doc, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

  const tweets = await Tweet.find({
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  if (!content) throw new ApiError(400, "Tweet cannot be empty");

  const doc = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      owner: userId,
    },
    {
      $set: { content: content },
    },
    { new: true }
  );

  if (doc) {
    return res
      .status(200)
      .json(new ApiResponse(200, doc, "Tweet updated successfully"));
  }
  throw new ApiError(404, "No such tweet found");
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  let doc = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: userId,
  });

  if (doc) {
    return res
      .status(200)
      .json(new ApiResponse(200, doc, "Tweet deleted successfully"));
  }
  throw new ApiError(404, "No such tweet found");
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
