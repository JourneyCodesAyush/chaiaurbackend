import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) throw new ApiError(400, "Name of the playlist cannot be empty");

  if (!description)
    throw new ApiError(400, "Description of the playlist cannot be empty");

  const userId = req?.user?._id;

  if (!userId)
    throw new ApiError(401, "Unauthorized action to create playlist");

  const playlist = await Playlist.create({
    owner: userId,
    name: name,
    description: description,
    videos: [],
  });

  if (!playlist) throw new ApiError(500, "Could not create playlist");

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Created playlist successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized action to get playlist");

  const doc = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
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
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $project: {
              "thumbnail.url": 1,
              title: 1,
              duration: 1,
              views: 1,
            },
          },
        ],
      },
    },
  ]);

  if (doc?.length === 0)
    return res.status(404).json(new ApiResponse(404, [], "Playlist not found"));

  return res
    .status(200)
    .json(new ApiResponse(200, doc[0], "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid vidoe id");

  const videoDoc = await Video.exists({ _id: videoId });
  const exists = videoDoc !== null;
  if (!exists) throw new ApiError(404, "Video does not exist");

  const userId = req?.user?._id;
  if (!userId)
    throw new ApiError(401, "Unauthorized action to add video to playlist");

  const doc = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: userId,
    },
    {
      $addToSet: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!doc)
    return res.status(404).json(new ApiResponse(404, [], "Playlist not found"));

  return res
    .status(200)
    .json(new ApiResponse(200, doc, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid vidoe id");

  const videoDoc = await Video.exists({ _id: videoId });
  const exists = videoDoc !== null;
  if (!exists) throw new ApiError(404, "Video does not exist");

  const userId = req?.user?._id;
  if (!userId)
    throw new ApiError(
      401,
      "Unauthorized action to remove video from playlist"
    );

  const doc = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: userId,
    },
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!doc)
    return res.status(404).json(new ApiResponse(404, [], "Playlist not found"));

  return res
    .status(200)
    .json(
      new ApiResponse(200, doc, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const userId = req?.user?._id;

  if (!userId)
    throw new ApiError(401, "Unauthorized action to delete playlist");

  const deletedPlaylist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: userId,
  });

  if (!deletedPlaylist)
    return res.status(404).json(new ApiResponse(404, [], "Playlist not found"));

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  if (!name) throw new ApiError(400, "Name of the playlist cannot be empty");

  if (!description)
    throw new ApiError(400, "Description of the playlist cannot be empty");

  const userId = req?.user?._id;

  if (!userId)
    throw new ApiError(401, "Unauthorized action to delete playlist");

  const doc = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: userId,
    },
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );

  if (doc) {
    return res
      .status(200)
      .json(new ApiResponse(200, doc, "Playlist updated successfully"));
  } else {
    return res
      .status(404)
      .json(new ApiResponse(404, doc, "No such playlist found"));
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
