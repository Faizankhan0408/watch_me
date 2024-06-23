import { ApiError } from "../utils/api_errors.js";
import { asyncHandler } from "../utils/async_handler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// _ ->"res" in this case
export const verifyJWT=asyncHandler(async(req,_,next)=>{
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
try {
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodeToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user=user;
        next();
} catch (error) {
    return new ApiError(401,error?.message || "Invalid access token")
}
});
