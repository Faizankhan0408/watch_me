import { Router } from "express";
import { addComment, deleteComment, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verifyJWT)

router.route("/add-comment").post(addComment)
router.route("/update-comment").patch(updateComment)
router.route("/delete-comment").delete(deleteComment)

export default router;