import { asyncHandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_errors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/api_response.js"

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

  const existedUser = User.findOne({
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

  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  if(!createdUser){
    throw new ApiError(500,"Something went wrong will registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Successfully")
  )

});

export { registerUser };
