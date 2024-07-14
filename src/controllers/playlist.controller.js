import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/api_errors.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async_handler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  console.log("name", name);
  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(500, "Some error occured while creating playlist");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log("userId", userId);

  const playlists = await Playlist.find({ owner: userId }).select(
    "-videos -updatedAt -__v"
  );

  if (!playlists) {
    throw ApiError(500, "Some error occured while fetching playlists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playlists = await Playlist.findById(playlistId).select("-__v");

  if (!playlists) {
    throw ApiError(500, "Some error occured while fetching given playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "Required Playlist fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const addVideoToPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId },
    },
    { new: true }
  );

  if (!addVideoToPlaylist) {
    throw new ApiError(
      500,
      "Some error occured while adding video in playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully video added in playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const removeVideoToPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );

  if (!removeVideoToPlaylist) {
    throw new ApiError(
      500,
      "Some error occured while removing video in playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully video removed in playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  const updatePlaylistResponse = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );

  if (!updatePlaylistResponse) {
    throw new ApiError(500, "Error while updating playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylistResponse,
        "playlist updated successfully"
      )
    );
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
