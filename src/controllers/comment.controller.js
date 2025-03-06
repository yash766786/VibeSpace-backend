import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Controller to get all comments for a post
// Updated Controller to get all comments for a post, including like count and usernames of likers
// const getPostComments = asyncHandler(async (req, res) => {
//     const { postId } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     // Validate the postId
//     if (!mongoose.isValidObjectId(postId)) {
//         return res
//             .status(400)
//             .json(new ApiError(400, "Invalid post ID"));
//     }

//     const pageNumber = parseInt(page, 10);
//     const pageSize = parseInt(limit, 10);

//     try {
//         // Get comments for the post with pagination
//         const comments = await Comment.find({ post: postId })
//             .populate("owner", "username fullname avatar") // populate owner details
//             .sort({ createdAt: -1 })
//             .skip((pageNumber - 1) * pageSize)
//             .limit(pageSize);

//         // Fetch likes for each comment
//         const commentsWithLikes = await Promise.all(comments.map(async (comment) => {
//             // Count total likes for the comment
//             const likeCount = await Like.countDocuments({ comment: comment._id });

//             // Fetch likers' usernames
//             const likers = await Like.find({ comment: comment._id })
//                 .populate("likedBy", "username") // populate likedBy details
//                 .select("likedBy -_id"); // include only likedBy field

//             return {
//                 ...comment.toObject(),
//                 likeCount,
//                 likers: likers.map(like => like.likedBy.username) // get usernames of likers
//             };
//         }));

//         // Count total comments for the post
//         const totalComments = await Comment.countDocuments({ post: postId });

//         // console.log("............................................")
//         // console.log(commentsWithLikes)
//         return res
//             .status(200)
//             .json(new ApiResponse(200, {
//                 comments: commentsWithLikes,
//                 totalPages: Math.ceil(totalComments / pageSize),
//                 currentPage: pageNumber
//             }, "Comments fetched successfully"));
//     } 
//     catch(error) {
//         // console.log(error);
//         return res
//             .status(500)
//             .json(new ApiError(500, "Something went wrong while fetching comments", error));
//     }
// });

const getPostComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    // const userId = req.user?._id

    // Validate the postId
    if (!mongoose.isValidObjectId(postId)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid post ID"));
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const currentUserId = req.user?._id; // Assuming req.user contains the authenticated user's ID

    try {
        // console.log("user id:   "+currentUserId)
        // Get comments for the post with pagination
        const comments = await Comment.find({ post: postId })
            .populate("owner", "username fullname avatar") // populate owner details
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        // Fetch likes and `isLikedByCurrentUser` for each comment
        const commentsWithLikes = await Promise.all(comments.map(async (comment) => {
            // Count total likes for the comment
            const likeCount = await Like.countDocuments({ comment: comment._id });
            // console.log("like count"+likeCount)

            // Check if current user has liked this comment
            const isLikedByCurrentUser = await Like.exists({ 
                comment: comment._id, 
                likedBy: currentUserId 
            });
            // console.log("isLikedByCurrentUser"+isLikedByCurrentUser)

            // Fetch likers' usernames
            const likers = await Like.find({ comment: comment._id })
                .populate("likedBy", "username") // populate likedBy details
                .select("likedBy -_id"); // include only likedBy field

            return {
                ...comment.toObject(),
                likeCount,
                likers: likers.map(like => like.likedBy.username), // get usernames of likers
                isLikedByCurrentUser: Boolean(isLikedByCurrentUser) // add isLikedByCurrentUser field
            };
        }));

        // console.log("............................................")
        // console.log(commentsWithLikes)

        // Count total comments for the post
        const totalComments = await Comment.countDocuments({ post: postId });

        return res
            .status(200)
            .json(new ApiResponse(200, {
                comments: commentsWithLikes,
                totalPages: Math.ceil(totalComments / pageSize),
                currentPage: pageNumber
            }, "Comments fetched successfully"));
    } 
    catch (error) {
        // console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while fetching comments", error));
    }
});


// Controller to add a comment to a post
const addComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    try {
        if (!mongoose.isValidObjectId(postId)) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid post ID"));
        }
    
        if (!content || !content.trim()) {
            return res
                .status(400)
                .json(new ApiError(400, "Comment content is required"));
        }

        const comment = await Comment.create({
            content: content.trim(),
            post: postId,
            owner: req.user._id
        });

        return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
    } 
    catch(error){
        // console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while adding the comment", error));
    }
});


// Controller to update a comment
// but looks like not needed
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    try {
        if (!mongoose.isValidObjectId(commentId)) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid comment ID"));
        }
    
        if (!content || !content.trim()) {
            return res
                .status(400)
                .json(new ApiError(400, "Updated comment content is required"));
        }

        const comment = await Comment.findOneAndUpdate(
            { 
                _id: commentId, 
                owner: req.user._id 
            }, // Ensure the comment belongs to the user
            { content: content.trim() },
            { new: true }
        );

        if (!comment) {
            return res
                .status(404)
                .json(new ApiError(404, "Comment not found or you are not authorized to update it"));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, comment, "Comment updated successfully"));
    } 
    catch(error){
        // console.log(error);
        return res.status(500).json(new ApiError(500, "Something went wrong while updating the comment", error));
    }
});


// Controller to delete a comment
// const deleteComment = asyncHandler(async (req, res) => {
//     // check if the comment id is valid
//     // check if the comment belongs to the user
//     // delete all the likes associated with the comment
//     // delete the comment
//     const { commentId } = req.params;

//     if(!mongoose.isValidObjectId(commentId)){
//         return res
//             .status(400)
//             .json(new ApiError(400, "Invalid comment ID"));
//     }

//     try{
//         const comment = await Comment.findOneAndDelete({
//             _id: commentId,
//             owner: req.user._id // Ensure the comment belongs to the user
//         });

//         if (!comment) {
//             return res
//                 .status(404)
//                 .json(new ApiError(404, "Comment not found or you are not authorized to delete it"));
//         }

//         return res
//             .status(200)
//             .json(new ApiResponse(200, null, "Comment deleted successfully"));
//     } 
//     catch(error){
//         // console.log(error);
//         return res
//             .status(500)
//             .json(new ApiError(500, "Something went wrong while deleting the comment", error));
//     }
// });

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // console.log("step 1: Received request to delete comment with ID:", commentId);

    // Step 1: Check if the comment ID is valid
    if (!mongoose.isValidObjectId(commentId)) {
        // console.log("Invalid comment ID:", commentId);
        return res
            .status(400)
            .json(new ApiError(400, "Invalid comment ID"));
    }

    try {
        // Step 2: Check if the comment belongs to the user
        // console.log("step 2: Checking ownership of the comment...");
        const comment = await Comment.findOne({
            _id: commentId,
            owner: req.user._id, // Ensure the comment belongs to the logged-in user
        });

        if (!comment) {
            // console.log(
                "Comment not found or unauthorized access. Comment ID:",
                commentId,
                "User ID:",
                req.user._id
            );
            return res
                .status(404)
                .json(new ApiError(404, "Comment not found or you are not authorized to delete it"));
        }
        // console.log("Comment ownership verified. Comment details:", comment);

        // Step 3: Delete all likes associated with the comment
        // console.log("step 3: Deleting all likes associated with the comment...");
        const deletedLikes = await Like.deleteMany({ comment: commentId });
        // console.log(
            "Deleted likes count:",
            deletedLikes.deletedCount,
            "for Comment ID:",
            commentId
        );

        // Step 4: Delete the comment
        // console.log("step 4: Deleting the comment...");
        await Comment.deleteOne({ _id: commentId });
        // console.log("Comment deleted successfully. Comment ID:", commentId);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Comment and associated likes deleted successfully"));
    } catch (error) {
        console.error(
            "Error while deleting the comment. Comment ID:",
            commentId,
            "Error:",
            error
        );
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while deleting the comment", error));
    }
});

export {
    getPostComments,
    addComment,
    updateComment,
    deleteComment
};
