import { Router } from "express";
import {login, registerUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"

const router=Router();

router.route("/login").post(login)

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

export default router