import { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Follow } from "../models/follow.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Toggle follow/unfollow a user
const toggleFollowUser = asyncHandler(async (req, res) => {

    // getting username from url
    const { username } = req.params;
    const userId = req.user?._id; // Assuming user is authenticated and userId is available in req.user

    try {
        // Validate if the user is trying to follow themselves
        const userToFollow = await User.findOne({ username });
        if (!userToFollow || !isValidObjectId(userToFollow._id)) {
            return res
                .status(404)
                .json(new ApiError(404, "User not found", error));
        }
        // console.log(userId)
        // console.log("username.....")
        // console.log(userToFollow)

        if (userToFollow._id.toString() === userId) {
            return res
                .status(400)
                .json(new ApiError(400, "You cannot follow yourself", error));
        }

        // Check if the user is already following
        const existingFollow = await Follow.findOne({
            follower: userId,
            following: userToFollow._id,
        });

        console.log("follow....")
        
        
        if (existingFollow) {
            // Unfollow user if already followed
            const follow = await Follow.findByIdAndDelete(existingFollow)
            console.log(follow)
            return res
                .status(200)
                .json(new ApiResponse(200, follow, `You have unfollowed ${username}`));
        }
        else {
            // Follow user if not already followed
            const follow = await Follow.create({
                follower: userId,
                following: userToFollow._id,
            });
            console.log(follow)
            return res
                .status(200)
                .json(new ApiResponse(200, follow, `You are now following ${username}`));
        }
    }
    catch (error) {
        console.log(error)
        return res
            .status(500)
            .json(new ApiError(500, `something went wrong follow/unfollow ${username}`, error))
    }
});


// Controller to get followers of a user
const getFollowers = asyncHandler(async (req, res) => {
    const { username } = req.params;

    try {
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res
                .status(404)
                .json(new ApiError(404, "User not found"));
        }

        // Find followers and populate follower details
        const followers = await Follow.find({ following: user._id })
            .populate("follower", "username fullname avatar")

        console.log("populated followers .")
        console.log(followers)

        return res
            .status(200)
            .json(new ApiResponse(200, followers, "Followers fetched successfully"));

    }
    catch (error) {
        console.log(error)
        return res
            .status(500)
            .json(new ApiError(500, "something went wrong while getting follwers", error))
    }
});


// Controller to get users the current user is following
const getFollowings = asyncHandler(async (req, res) => {
    const { username } = req.params;

    try {
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res
                .status(404)
                .json(new ApiError(404, "User not found", error));
        }

        // Find followings
        const followings = await Follow.find({ follower: user._id })
            .populate("following", "username fullname avatar");

        return res
            .status(200)
            .json(new ApiResponse(200, followings, "Following fetched successfully"));

    }
    catch (error) {
        console.log(error)
        return res
            .status(500)
            .json(new ApiError(500, "something went wrong while getting follwers", error))

    }
});

export {
    toggleFollowUser,
    getFollowers,
    getFollowings
}