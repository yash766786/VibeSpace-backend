import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Controller to get all comments for a post
// Updated Controller to get all likers for a post, including like count and usernames of likers
const getPostLikes = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate the postId
    if (!mongoose.isValidObjectId(postId)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid post ID"));
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    try {
        // Get likers for the post with pagination
        const likes = await Like.find({ post: postId })
            .populate("likedBy", "username fullname avatar") // populate owner details
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        // Fetch likes for each comment
        // const commentsWithLikes = await Promise.all(comments.map(async (comment) => {
        //     // Count total likes for the comment
        //     const likeCount = await Like.countDocuments({ comment: comment._id });

        //     // Fetch likers' usernames
        //     const likers = await Like.find({ comment: comment._id })
        //         .populate("likedBy", "username") // populate likedBy details
        //         .select("likedBy -_id"); // include only likedBy field

        //     return {
        //         ...comment.toObject(),
        //         likeCount,
        //         likers: likers.map(like => like.likedBy.username) // get usernames of likers
        //     };
        // }));

        // // Count total comments for the post
        // const totalComments = await Comment.countDocuments({ post: postId });

        return res
            .status(200)
            .json(new ApiResponse(200, likes , "Comments fetched successfully"));
    } 
    catch(error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while fetching comments", error));
    }
});


const togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(postId)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid post ID", error));
    }

    try {
        // Check if the user has already liked the post
        let isLiked = await Like.findOne({ post: postId, likedBy: userId });

        if(isLiked){
            // If the user has already liked the post, remove the like
            const unlike = await Like.findByIdAndDelete(isLiked._id);
            return res
                .status(200)
                .json(new ApiResponse(200, unlike, "Post unliked successfully"));
        } 
        else{
            // If the user has not liked the post, add a new like
            const like = await Like.create({
                post: postId,
                likedBy: userId
            });
            return res
                .status(201)
                .json(new ApiResponse(201, like, "Post liked successfully"));
        }
    } 
    catch(error){
        console.error(error);
        return res.status(500).json(new ApiError(500, "Something went wrong while toggling post like", error));
    }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(commentId)){
        return res
            .status(400)
            .json(new ApiError(400, "Invalid comment ID", error));
    }

    try {
        // Check if the user has already liked the comment
        const isLiked = await Like.findOne({ 
            comment: commentId, 
            likedBy: userId 
        });

        if(isLiked){
            // If the user has already liked the comment, remove the like
            const unlike = await Like.findByIdAndDelete(isLiked._id);
            return res
                .status(200)
                .json(new ApiResponse(200, unlike, "Comment unliked successfully"));
        } 
        else{
            // If the user has not liked the comment, add a new like
            const like = await Like.create({
                comment: commentId,
                likedBy: userId
            });
            return res
                .status(201)
                .json(new ApiResponse(201, like, "Comment liked successfully"));
        }
    } 
    catch(error){
        console.error(error);
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while toggling comment like", error));
    }
});

export {
    getPostLikes,
    togglePostLike,
    toggleCommentLike
};
