import { Router } from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verifyJWT)

router.route("/add-comment").post(addComment)
router.route("/get-video-comments/:videoId").get(getVideoComments)
router.route("/update-comment/:commentId").patch(updateComment)
router.route("/delete-comment/:commentId").delete(deleteComment)

export default router;