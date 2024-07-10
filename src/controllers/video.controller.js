import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api_errors.js";
import { ApiResponse } from "../utils/api_response.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { asyncHandler } from "../utils/async_handler.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    console.log("title",title);
    if(!(title && description)){
        throw new ApiError(400,"Title or description is required")
    }

    const videoLocalPath=req.files?.videoFile[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    if(!videoLocalPath){
        throw new ApiError(400,"Video file is required")
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required")
    }

    const videoLink=await uploadOnCloudinary(videoLocalPath);
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoLink){
        throw new ApiError(500,"some error while uploading video")
    }

    if(!thumbnail){
        throw new ApiError(500,"some error while uploading thumbnail")
    }

    console.log("videoLink",videoLink);

    const user=req.user;
    console.log(user);

   const videoResponse=await Video.create({
    videoFile:videoLink.url,
    title:title,
    description:description,
    thumbnail:thumbnail.url,
    owner:user?._id,
    duration:videoLink.duration
    })
    console.log("videoResponse",videoResponse);

    if(!videoResponse){
        throw new ApiError(500,"Some error occured while uploading video into database")
    }

    return res.status(201).json(new ApiResponse(200,videoResponse,"Video uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.query
    console.log("videoId");
    console.log(req.query);
    //TODO: get video by id
   const video= await Video.findById(videoId)
   if(!video){
    throw new ApiError(400,"Video not exists")
   }

   return res.status(200).json(new ApiResponse(200,video,"video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.query
    //TODO: delete video
    if(!videoId){
        throw new ApiError(400,"Video not exists")
    }

    const videoResponse=await Video.findByIdAndDelete(videoId)

    if(!videoResponse){
        throw new ApiError(500,"Unable to delete video try later")
    }

    return res.status(200).json(new ApiResponse(200,{},"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.query

   const {isPublished}=await Video.findById(videoId)
    const response=await Video.findByIdAndUpdate(videoId,{
        $set:{
            isPublished:!isPublished
        }
    })
    if(!response){
        throw new ApiError(500,"Error while updating status")
    }
    console.log(response);
    return res.status(200).json(new ApiResponse(200,{},"Updated successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}