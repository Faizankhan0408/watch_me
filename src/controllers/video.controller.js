import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api_errors.js";
import { ApiResponse } from "../utils/api_response.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { asyncHandler } from "../utils/async_handler.js";

const getAllVideos = asyncHandler(async (req, res) => {
    let { page, limit, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    console.log("page",page);
    console.log("limit",limit);
    limit=parseInt(limit)
    page=parseInt(page)
    const pipeline = [
        { $match: { isPublished: true } }, // Filter for published videos
        {
            $lookup: {
                from: 'users', // The name of the User collection
                localField: 'owner', // The field in the Video collection
                foreignField: '_id', // The field in the User collection
                as: 'ownerDetails' // The name of the new array field containing the user document
            }
        },
        { $unwind: '$ownerDetails' }, // Unwind the array to denormalize the data
        {
            $project: {
                _id: 1, // Include video id
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
                'ownerDetails.fullname': 1,
                'ownerDetails.avatar': 1,
                'ownerDetails._id':1,
                'ownerDetails.username':1
            }
        },
        { $skip: (page - 1) * limit }, // Skip for pagination
        { $limit: limit } // Limit the number of documents returned
    ];

    // Run the aggregation pipeline
    const videos = await Video.aggregate(pipeline);

    // Count the total number of documents that match the filter
    const totalCountPipeline = [{ $match: { isPublished: true } }, { $count: 'count' }];
    const countResult = await Video.aggregate(totalCountPipeline);
    console.log("countResult",countResult);
    const totalCount = countResult[0]?.count || 0;

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Create the result object
    const result = {
        docs: videos,
        totalDocs: totalCount,
        limit: limit,
        page: page,
        totalPages: totalPages
    };

    console.log(result);

    return res.status(200).json(new ApiResponse(200,result,"video fetched successfully"))
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
    const {title,description}=req.body

    const videoLocalPath=req.files?.videoFile[0]?.path
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path

    const video=await uploadOnCloudinary(videoLocalPath)
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)

    if(!(video && thumbnail)){
        throw new ApiError(400,"Please upload video file")
    }

    const updateResponse=await Video.findByIdAndUpdate(videoId,{
        $set:{
            title:title,
            description:description,
            videoFile:video.url,
            thumbnail:thumbnail.url,
            duration:video.duration
        }
    })

    if(!updateResponse){
        throw new ApiError(500,"Some error occured while updating video")
    }

    return res.status(200).json(new ApiResponse(200,{},"Video updated successsfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
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
    const { videoId } = req.params

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

const incrementViewCountAndAddToWatchHistory = asyncHandler(async(req,res)=>{
    const {videoId,userId}=req.params       
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Increment the view count of the video
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            { $inc: { views: 1 } },
            { new: true, session }
        );

        if (!updatedVideo) {
            throw new Error('Video not found');
        }

        // Add the video ID to the user's watch history
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { watchHistory: videoId } }, // $addToSet ensures no duplicates
            { new: true, session }
        );

        if (!updatedUser) {
            throw new Error('User not found');
        }

        await session.commitTransaction();
        session.endSession();

        console.log('View count incremented and video added to watch history:', { updatedVideo, updatedUser });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Transaction failed:', error);
    }
    return res.status(200).json(new ApiResponse(200,{},"incremented successfully"))
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViewCountAndAddToWatchHistory
}