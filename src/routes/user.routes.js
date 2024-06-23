import { Router } from "express";
import {loginUser, logoutUser, registerUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/login").post(loginUser)

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"cover_image",
            maxCount:1
        }
    ]),
    registerUser)

// secured routes
router.route("/logout").post(verifyJWT,logoutUser)

export default router