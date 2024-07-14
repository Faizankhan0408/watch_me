import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router=Router()

router.use(verifyJWT)

router.route("/create-playlist").post(createPlaylist)
router.route("/get-playlists/:userId").get(getUserPlaylists)
router.route("/get-playlist-by-id/:playlistId").get(getPlaylistById)
router.route("/add-video-to-playlist/:playlistId/:videoId").patch(addVideoToPlaylist)
router.route("/remove-video-to-playlist/:playlistId/:videoId").patch(removeVideoFromPlaylist)
router.route("/update-playlist/:playlistId").patch(updatePlaylist)

export default router;