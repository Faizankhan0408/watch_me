import { asyncHandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_errors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/api_response.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken=async(userId)=>{
  // console.log("userId--->",userId)
try {
  const user=await User.findById(userId)
  const accessToken=user.generateAccessToken()
  const refreshToken=user.generateRefreshToken()

  // console.log("refreshToken -->>",refreshToken)

  user.refreshToken=refreshToken
 const value= await user.save({validateBeforeSave:false})
  // console.log("Bhai value is::>",value)
  // console.log("accessToken-->",accessToken)
  // console.log("refreshToken-->",refreshToken)
  return {accessToken,refreshToken}

} catch (error) {
  throw new ApiError(500,"Something went wrong while generating access token")
}
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation -not empty
  //check if user is already exists
  //check for images
  //upload them to cloudinary ,avatar
  //create user object - create entry in db
  //remove password and refresh token
  //check for user creation
  //return res

  const { fullname, email, username, password } = req.body;
  console.log("email:", email);

  if (
    [
        fullname, email, username, password
    ].some(
      (value, index, array) => value?.trim() === ""
    )
  ) {
     throw new ApiError(400, "All fields are required");
  }

  const existedUser =await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverTmageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverTmageLocalPath);


  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken")

  if(!createdUser){
    throw new ApiError(500,"Something went wrong will registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Successfully")
  )

});

const loginUser=asyncHandler(async(request,response)=>{
  
  //get username and email
  //validate user
  //validate password
  
    const {username,email,password}=request.body;
    
    if(!(username && email)){
      throw new ApiError(404,"Username or email is required")
    }
  
    const user=await User.findOne({
      $or:[{username},{email}]
    })
    
    if(!user){
      throw new ApiError(404,"User not exist")
    }
  
    const isPasswordCorrect=await user.isPasswordCorrect(password)
  
    if(!isPasswordCorrect){
      throw new ApiError(401,"Invalid user credentail")
    }
  
     const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)
  
     const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
  
     const options={
      httpOnly:true,
      secure:true
     }
  
     return response.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"Logged in successfully"))
  })
  
  
  const logoutUser=asyncHandler(async(req,res)=>{
      User.findByIdAndUpdate(
        req.user._id,
        {
          $set:{
            refreshToken:undefined
          }
        },{
          new:true
        }
      )
  
  
      const options={
        httpOnly:true,
        secure:true
      }
  
      return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(new ApiResponse(200,{},"User logged out successfully"))
  })

  const refreshAccessToken = asyncHandler(async (req, res) => {
try {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
      // console.log("Refresh token is --->",incomingRefreshToken)
  
      if (!incomingRefreshToken) {
          throw new ApiError(401, "unauthorized request")
      }
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )
    // console.log("Decoded token",decodedToken)
  
    const user = await User.findById(decodedToken?._id)
  
    if (!user) {
        throw new ApiError(401, "Invalid refresh token")
    }
  
    // console.log("Token yeh hai -->>",user?.refreshToken)
    // console.log("Token yeh hai -->>",user?._id)
  
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")
        
    }
  
  
    
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
    const options = {
      httpOnly: true,
      secure: true
      }
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
        )
    )
} catch (error) {
  throw new ApiError(401, error?.message || "Invalid refresh token")
}


})
  
  export { registerUser ,loginUser,logoutUser,refreshAccessToken};

