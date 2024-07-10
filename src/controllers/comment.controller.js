import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import {ApiError} from "../utils/api_errors.js";
import {ApiResponse} from "../utils/api_response.js";
import {asyncHandler} from "../utils/async_handler.js";

const getVideoComments=asyncHandler(async(req,res)=>{
    // TODO : get all comment of that video
    const {videoId}=req.params
    const {page=1,limit=10}=req.query

})

const addComment=asyncHandler(async(req,res)=>{
    const {content,videoId}=req.body
    
    if(!content){
        throw new ApiError(400,"Please add comment content")
    }

    const {user}=req.user

   const comment= await Comment.create({
        content,
        owner:user?._id,
        videoId
    })

    if(!comment){
        throw new ApiError(500,"Unable to save comment in db")
    }

    return res.status(201).
    json(new ApiResponse(200,comment,"Comment added successfully"))    
})

const updateComment=asyncHandler(async(req,res)=>{
    const {content,comment_id}=req.body;
    console.log("comment_id",comment_id);

    if(!content){
        throw new ApiError(400,"Please provide content of comment to update")
    }

  const updateStatus= await Comment.findByIdAndUpdate(comment_id,{
    $set:{
        content:content
    }
  })

  if(!updateStatus){
    throw new ApiError(500,"Some database error while updating comment")
  }

  return res.status(200).json(new ApiResponse(200,{},"comment updated successfully"))
})


const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {comment_id}=req.body;
    console.log("comment_id",comment_id);

    if(!comment_id){
        throw new ApiError(400,"Please provide comment_id of comment to update")
    }

  const deleteStatus= await Comment.findByIdAndDelete(comment_id)

  if(!deleteStatus){
    throw new ApiError(500,"Some database error while deleting comment")
  }

  return res.status(200).json(new ApiResponse(200,{},"comment deleted successfully"))
})


export {addComment,updateComment,deleteComment};