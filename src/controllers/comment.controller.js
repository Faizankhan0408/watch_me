import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/api_errors.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async_handler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // TODO : get all comment of that video
  const { videoId } = req.params;
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  // Aggregate to get the total count of comments for the specified video
  const totalCountPipeline = [
    { $match: { video:new mongoose.Types.ObjectId(videoId) } },
    { $count: "totalCount" },
  ];
  const totalCountResult = await Comment.aggregate(totalCountPipeline);
  const totalCount =
    totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

  // Aggregate to get the paginated comments
  const commentsPipeline = [
    { $match: { video:new mongoose.Types.ObjectId(videoId) } },
    {
      $project: {
        _id: 1,
        content: 1,
        video: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $skip: (page - 1) * limit }, // Skip documents based on page number
    { $limit: limit }, // Limit the number of documents returned
  ];
  const comments = await Comment.aggregate(commentsPipeline);

  if(!comments){
    throw ApiError(500,"Error occured while fetching comments")
  }
  const result={
    comments,totalCount,page,limit
  }

  return res.status(200).json(new ApiResponse(200,result,"Comment fetched successfully"))
});

const addComment = asyncHandler(async (req, res) => {
  const { content, videoId } = req.body;

  if (!content) {
    throw new ApiError(400, "Please add comment content");
  }

  const { user } = req.user;

  const comment = await Comment.create({
    content,
    owner: user?._id,
    video: videoId,
  });

  if (!comment) {
    throw new ApiError(500, "Unable to save comment in db");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;
  console.log("content", content);

  if (!content) {
    throw new ApiError(400, "Please provide content of comment to update");
  }

  const updateStatus = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  if (!updateStatus) {
    throw new ApiError(500, "Some database error while updating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateStatus, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  console.log("commentId", commentId);

  if (!commentId) {
    throw new ApiError(400, "Please provide comment_id of comment to update");
  }

  const deleteStatus = await Comment.findByIdAndDelete(commentId);

  if (!deleteStatus) {
    throw new ApiError(500, "Some database error while deleting comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

export { addComment, updateComment, deleteComment,getVideoComments };
