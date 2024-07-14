import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { deleteVideo, getAllVideos, getVideoById, incrementViewCountAndAddToWatchHistory, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router=Router();


router.use(verifyJWT)

router.route("/publish-video").post(upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),publishAVideo)

router.route("/get-video-by-id").get(getVideoById)
router.route("/get-all-videos").get(getAllVideos)
router.route("/update-view-count/:videoId/:userId").patch(incrementViewCountAndAddToWatchHistory)
router.route("/delete-video/:videoId").delete(deleteVideo)
router.route("/toggle-video-status/:videoId").patch(togglePublishStatus)
router.route("/update-video/:videoId").patch(upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),updateVideo)

export default router