import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // If channel id is not given, straight away return with an error
  // If user is not found, that means not logged in (unreachable state)
  // If user and channel are same, can't subscribe to yourself
  // Find the document which contains user and the subscribed channel
  // If document is not found, means unsubscribed, hence subscribe
  // If document is found, means user is subscribed to channel, hence unsubscribe

  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Invalid channel Id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action");

  // console.log("userId:", userId, typeof userId);
  // console.log("channelId:", channelId, typeof channelId);
  // console.log("equal:", userId.equals?.(channelId));

  // console.log("Before finding one...");
  if (userId.equals(channelId))
    throw new ApiError(400, "Cannot subscribe your own channel");

  let doc = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  let newSubscribedState;

  if (doc) {
    await Subscription.findOneAndDelete({
      subscriber: userId,
      channel: channelId,
    });
    newSubscribedState = false;
  } else {
    await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });
    newSubscribedState = true;
  }

  // console.log("Toggling subscription");
  // console.log(doc);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribed: newSubscribedState },
        "Subscription toggled successfully!"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // Check for the validity of subscriber id
  // Get all documents where 'channel' is current user
  // Join the 'subscriber' with corresponding users
  // Do NOT include password, refreshToken, __v of the user
  // Return the object containing

  if (!isValidObjectId(subscriberId))
    throw new ApiError(400, "Invalid channel Id");

  // console.log("Channel Id: ", subscriberId);

  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $lookup: {
        from: "users", // collection name (lowercase plural)
        localField: "subscriber", // Field in Subscription
        foreignField: "_id", // Field in User
        as: "subscriberDetails",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
              __v: 0,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriberDetails",
    },
    {
      $replaceRoot: {
        newRoot: "$subscriberDetails",
      },
    },
  ]);

  // console.log("Subscribers: ", subscribers);

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // Check for the validity of subscriber id
  // Get all documents where 'subscriber' is current user
  // Join details of 'channel' in all these documents
  // Do NOT include password, refreshToken, __v of the user
  // Return the object containing

  if (!isValidObjectId(subscriberId))
    throw new ApiError(400, "Invalid channel Id");

  const subscribed = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedDetails",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
              __v: 0,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribedDetails",
    },
    {
      $replaceRoot: {
        newRoot: "$subscribedDetails",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribed,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
