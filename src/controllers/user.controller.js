// controllers/user.controller.js
import Jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    destroyFromCloudinary,
    uploadOnCloudinary
} from "../service/cloudinary.js";
import { sendVerificationEmail } from "../helper/mailer.js";


const generateAccessToken = async (user) => {
    console.log("--generating token--")

    return Jwt.sign(
        {
            _id: user._id.toString(),
            username: user.username,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};

const generateResetToken = async (email) => {
    console.log("--generating token--")
    return Jwt.sign(
        { 
            email, 
            type: "PASSWORDRESET" 
        }, 
        process.env.RESET_TOKEN_SECRET, 
        {
            expiresIn: process.env.RESET_TOKEN_EXPIRY
        }
    );
};


// done
const registerUser = asyncHandler(async (req, res) => {
    // 1. get user detail
    // 2. check all fields -> username, email, fullname, password
    // 3. check for images -> avatar
    // 4. check existedUserByEmail
    //     # if verifed-> return email already exist
    //     # if not verified -> delete object existeduserbyemail for making new object for this user
    //                        also destroy the avatar from cloudinary
    // 5. check existedUserByUsername
    //     # if verifed-> return username already exist
    //     # if not verified -> delete object existedUserByUsername for making new object for this user
    //                        also destroy the avatar from cloudinary
    // 6. upload avatar on cloudinary for new user
    // 7. generate random code of 6 length
    // 8. create user object - create entry in db
    // 9. check for user creation successfully or not and remove password field
    // 10. Generate access token
    // 11. Send email with verification code (we will verify email through otp)
    // 12. set cookies
    // 13. send response 

    const { username, email, fullname, password } = req.body;
    const avatarLocalPath = req.file?.path;

    console.log("Step 1: Received user data", { username, email, fullname });

    try {
        // Step 2: Validate required fields
        if ([username, email, fullname, password].some((field) => !field || field.trim() === "")) {
            console.log("Step 2: Validation failed - missing fields");
            return res
                .status(400)
                .json(new ApiError(400, "All fields are required"));
        }
        console.log("Step 2: Validation passed - all required fields provided");

        // Step 3: Validate avatar
        if (!avatarLocalPath) {
            console.log("Step 3: Validation failed - avatar file is missing");
            return res
                .status(400)
                .json(new ApiError(400, "Avatar file is required"));
        }
        console.log("Step 3: Validation passed - avatar file provided");

        // Step 4: Check for existing user by email
        const existingUserByEmail = await User.findOne({ email });
        console.log("Step 4: Checked for existing user by email", existingUserByEmail);
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                console.log("Step 4: Email already exists with a verified user");
                return res
                    .status(409)
                    .json(new ApiError(409, "User with this email already exists"));
            } else {
                console.log("Step 4: Unverified email found - cleaning up existing record");
                await destroyFromCloudinary(existingUserByEmail.avatar.split("/").pop().split(".")[0]);
                await existingUserByEmail.deleteOne();
                console.log("Step 4: Unverified user by email cleaned up");
            }
        }

        // Step 5: Check for existing user by username
        const existingUserByUsername = await User.findOne({ username });
        console.log("Step 5: Checked for existing user by username", existingUserByUsername);
        if (existingUserByUsername) {
            if (existingUserByUsername.isVerified) {
                console.log("Step 5: Username already exists with a verified user");
                return res
                    .status(409)
                    .json(new ApiError(409, "User with this username already exists"));
            } else {
                console.log("Step 5: Unverified username found - cleaning up existing record");
                await destroyFromCloudinary(existingUserByUsername.avatar.split("/").pop().split(".")[0]);
                await existingUserByUsername.deleteOne();
                console.log("Step 5: Unverified user by username cleaned up");
            }
        }

        // Step 6: Upload avatar to Cloudinary
        const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Step 6: Uploaded avatar to Cloudinary", uploadedAvatar.url);
        if (!uploadedAvatar) {
            console.log("Step 6: Failed to upload avatar to Cloudinary");
            return res
                .status(500)
                .json(new ApiError(500, "Failed to upload avatar to Cloudinary"));
        }

        // Step 7: Generate random 6-digit verification code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpiry = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes
        console.log("Step 7: Generated verification code", { verifyCode, verifyCodeExpiry });

        // Step 8: Create user object in database
        const newUser = await User.create({
            username: username.toLowerCase(),
            email,
            fullname,
            password,
            avatar: uploadedAvatar.url,
            verifyCode,
            verifyCodeExpiry,
        });
        console.log("Step 8: User created in database", newUser);

        // Step 9: Remove password field from response
        const createdUser = await User.findById(newUser._id).select("-password -verifyCode -verifyCodeExpiry");
        console.log("Step 9: Retrieved user without password", createdUser);
        if (!createdUser) {
            console.log("Step 9: Failed to retrieve user without password");
            return res
                .status(500)
                .json(new ApiError(500, "Error creating user account"));
        }

        // Step 10: Generate access token
        const accessToken = await generateAccessToken(newUser);
        console.log("Step 10: Generated access token", accessToken);

        // Step 11: Send verification email
        sendVerificationEmail(createdUser, verifyCode, "REGISTER");
        console.log("Step 11: Sent verification email with code");

        // Step 12: Set cookies
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "None", // For cross-site cookies
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        };
        console.log("Step 12: Cookie options set", cookieOptions);

        // Step 13: Send response
        console.log("Step 13: Sending response");
        return res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .json(new ApiResponse(201, createdUser, "Verification email sent"));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500,
                "An unexpected error occurred. Please try again later",
                error
            ))
    }
});

// done
const verifyEmail = asyncHandler(async (req, res) => {
    // 1. get the userId from the token
    // 2. get the verification code from the request
    // 3. Find the user from the userId 
    // 4. verify the code with verifyCode 
    //    # if code match -> set the user as verified
    //    # if code did not match -> return verification code did not match
    // 5. send response
    console.log("Step 1: Starting email verification process");
    
    try {
        // Step 1: Get the userId from the token
        const userId = req.user?._id;
        console.log("Step 1: Extracted userId from token", userId);
        if (!userId) {
            console.log("Step 1: User ID not found in token");
            return res
            .status(401)
            .json(new ApiError(401, "Unauthorized access"));
        }
        
        // Step 2: Get the verification code from the request
        const { verifyCode } = req.body;
        console.log("Step 2: Received verification code", verifyCode);
        if (!verifyCode) {
            console.log("Step 2: Verification code is missing");
            return res
                .status(400)
                .json(new ApiError(400, "Verification code is required"));
        }

        // Step 3: Find the user by userId
        const user = await User.findById(userId);
        console.log("Step 3: Retrieved user from database", user);

        if (!user) {
            console.log("Step 3: User not found in database");
            return res
                .status(404)
                .json(new ApiError(404, "User not found"));
        }

        // step 3.1: check if user is already verified
        if(user.isVerified){
            return res
            .status(409 )
            .json(new ApiError(409 ,"You are already verified"));
        } 

        // Step 4: verification of code
        // step 4.1: check the verifyCodeExpiry
        if (user.verifyCodeExpiry && user.verifyCodeExpiry < Date.now()) {
            console.log(
                "Step 4: Verification code expired",
                { storedCode: user.verifyCode, expiry: user.verifyCodeExpiry }
            );
            return res
                .status(400)
                .json(new ApiError(400, "Verification code has expired, please Register Again"));
        }

        // step 4.2: Verify the code
        if (user.verifyCode !== verifyCode) {
            console.log(
                "Step 4: Verification code mismatch or code expired",
                { storedCode: user.verifyCode, expiry: user.verifyCodeExpiry }
            );
            return res
                .status(400)
                .json(new ApiError(400, "Verification code is invalid"));
        }
        
        // Step 4.3: Mark the user as verified
        user.isVerified = true;
        user.verifyCode = null; // Clear the verification code
        user.verifyCodeExpiry = null; // Clear the expiry
        await user.save();
        console.log("Step 4.1: User marked as verified and saved to database", user);

        // Step 5: Send response
        console.log("Step 5: Email verified successfully");
        return res
            .status(200)
            .json(new ApiResponse(200, user, "Email verified successfully", "first_time_verified"));
    } catch (error) {
        console.log("Error during email verification", error);
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while email verification", error));
    }
});

// done
const loginUser = asyncHandler(async (req, res) => {
    // 1. get login details -> username, email, password
    // 2. check validation -> need anyone field(username or email) and password
    // 3. find the user
    // 4. check user is verified or not 
    // 5. check password
    // 6. generate access token
    // 7. set cookies
    // 8. send response

    console.log("Step 1: Starting login process");

    try {
        // Step 1: Get login details -> username, email, password
        const { username, email, password } = req.body;
        console.log("Step 1: Received login details", { username, email });

        // Step 2: Check validation -> need anyone field (username or email) and password
        if ((!username && !email) || !password) {
            console.log("Step 2: Validation failed - Missing username/email or password");
            return res
                .status(400)
                .json(new ApiError(400, "Username/Email and Password are required"));
        }
        console.log("Step 2: Validation passed");

        // Step 3: Find the user
        const user = await User.findOne({
            $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }],
        });
        console.log("Step 3: Retrieved user from database", user);

        if (!user) {
            console.log("Step 3: User not found");
            return res
                .status(404)
                .json(new ApiError(404, "User does not exist"));
        }

        // Step 4: Check if user is verified
        // if (!user.isVerified) {
        //     console.log("Step 4: User is not verified");
        //     return res
        //         .status(403)
        //         .json(new ApiError(403, "Account is not verified. Please verify your email"));
        // }
        // console.log("Step 4: User is verified");

        // Step 5: Check password
        const isPasswordCorrect = await user.verifyPassword(password);
        console.log("Step 5: Password verification result", isPasswordCorrect);

        if (!isPasswordCorrect) {
            console.log("Step 5: Invalid password");
            return res
                .status(400)
                .json(new ApiError(400, "Invalid password"));
        }
        console.log("Step 5: Password is valid");

        // Step 6: Generate access token
        const accessToken = await generateAccessToken(user);
        console.log("Step 6: Generated access token", accessToken);

        // Step 7: Set cookies
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "None", // For cross-site cookies
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        };
        console.log("Step 7: Cookie options set", cookieOptions);

        // Step 8: Send response
        const loggedInUser = await User.findById(user._id).select("-password -verifyCode -verifyCodeExpiry");
        console.log("Step 8: Sending response with user details");

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
    } catch (error) {
        console.log("Error during login process", error);
        return res
            .status(500)
            .json(new ApiError(500, "An unexpected error occurred. Please try again later", error));
    }
});

// done
const logoutUser = asyncHandler(async (req, res) => {

    // delete cookie
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",  // Required for cross-site cookies
        maxAge: 0  // optional
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

// done
const getCurrentUser = asyncHandler(async (req, res) => {
    // 1. get the userId from the token
    // 2. find user
    // 3. send response 

    console.log("Step 1: Starting to fetch the current user");

    try {
        // Step 1: Get the user ID from the token
        const userId = req.user._id;
        console.log("Step 1: User ID extracted from token:", userId);

        // Step 2: Find the user
        const user = await User.findById(userId).select("-password -verifyCode -verifyCodeExpiry");
        console.log("Step 2: Fetched user details from database:", user);

        if (!user) {
            console.log("Step 2: User not found");
            return res
                .status(404)
                .json(new ApiError(404, "User not found"));
        }

        // Step 3: Send response
        console.log("Step 3: Sending user details in response");
        return res
            .status(200)
            .json(new ApiResponse(200, user, "Current user fetched successfully"));

    } catch (error) {
        console.log("Error while fetching the current user:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while fetching the user details", error));
    }
});


const updateAccountDetails = asyncHandler(async (req, res) => {

    // get the detail
    const userId = req.user._id;
    const { fullname, username } = req.body
    if (!fullname || !username) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
    }

    try {
        // Check the new username is already taken by someone else
        const existedUserByUsername = await User.findOne({ username })
        if (existedUserByUsername && existedUserByUsername._id.toString() !== userId.toString()) {
            return res
                .status(400)
                .json(new ApiError(400, "Username is already taken", error));
        }

        // update the field
        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set: {
                fullname,
                username
            }
        },
            {
                new: true
            }).select("-password -verifyCode -verifyCodeExpiry")

        // send response
        return res
            .status(200)
            .json(new ApiResponse(200, user, "account details updated successfully"))

    } catch (error) {
        console.log(error)
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while updating user details", error))
    }

})


const updateUserAvatar = asyncHandler(async (req, res) => {

    // get the details
    const userId = req.user?._id
    const avatarLocalPath = req.file?.path

    // check file 
    if (!avatarLocalPath) {
        return res
            .status(400)
            .json(new ApiError(400, "Avatar file is missing"))
    }

    try {
        // upload on cloudinary
        const newAvatar = await uploadOnCloudinary(avatarLocalPath)
        if (!newAvatar.url) {
            return res
                .status(400)
                .json(new ApiError(400, "Error while uploading on avatar"))
        }

        // get the old avatar 
        const userWithOldAvatar = await User.findById(userId)

        // check if connection closed then abort the operations else continue
        if (req.customConnectionClosed) {
            console.log("Connection closed!! deleting avatar");
            await destroyFromCloudinary(newAvatar.url);
            return;     // preventing further execution   
        }

        // update avatar
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    avatar: newAvatar.url
                }
            },
            { new: true }
        ).select("-password -verifyCode -verifyCodeExpiry")

        // old avatar destroy from cloudinary
        const oldAvatarPublicId = userWithOldAvatar.avatar.split("/").pop().split(".")[0]
        await destroyFromCloudinary(oldAvatarPublicId)

        console.log("avatarLocalPath ..", avatarLocalPath)
        console.log("oldAvatarFilePath ..", oldAvatarPublicId)

        // send response
        return res
            .status(200)
            .json(new ApiResponse(200, user, "post updated successfully"))
    }
    catch (error) {
        console.log(error)
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while updating Avatar", error))
    }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {

    // get possword - old and new
    const { oldPassword, newPassword } = req.body

    try {
        // check old password
        // const user = await User.findById(req.user?._id)

        // Step 1: Get the user ID from the token
        const userId = req.user._id;
        console.log("Step 1: User ID extracted from token:", userId);

        // Step 2: Find the user
        const user = await User.findById(userId).select("-password -verifyCode -verifyCodeExpiry");
        console.log("Step 2: Fetched user details from database:", user);

        if (!user) {
            console.log("Step 2: User not found");
            return res
                .status(404)
                .json(new ApiError(404, "User not found"));
        }

        if(!user.isVerified){
            console.log("Step 2: User is not verified");
            return res
                .status(404)
                .json(new ApiError(404, "User is not verified. Please verify first"));
        }

        // check old password
        const verifyPassword = await user.verifyPassword(oldPassword)
        if (!verifyPassword) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid old password"))
        }

        // update password
        user.password = newPassword
        await user.save({ validateBeforeSave: false })

        // send response
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "password changed successfully"))
    }
    catch (error) {
        console.log(error)
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while changing user password", error))
    }

})


const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    // Step 1: Check if the username is valid
    if (!username?.trim()) {
        console.log("Error: Username is missing");
        return res.status(400).json(new ApiError(400, "username is missing"));
    }

    try {
        console.log(`Fetching profile for username: ${username.toLowerCase()}`);

        // Step 2: Aggregate user profile data
        const userProfile = await User.aggregate([
            {
                $match: {
                    username: username.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "_id",
                    foreignField: "following",
                    as: "followers"
                }
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "_id",
                    foreignField: "follower",
                    as: "following"
                }
            },
            {
                $addFields: {
                    followerCount: { $size: "$followers" },
                    followingCount: { $size: "$following" },
                    // isFollowed: {
                    //     $in: [req.user?._id, "$followers.follower"]
                    // },
                    follower: "$followers.follower"
                }
            },
            {
                $project: {
                    fullname: 1,
                    username: 1,
                    followerCount: 1,
                    followingCount: 1,
                    isFollowed: 1,
                    avatar: 1,
                    email: 1,
                    follower: 1
                }
            }
        ]);

        // Step 3: Log the aggregation result
        console.log("Aggregation result:", userProfile);

        // Step 4: Handle case where no profile is found
        if (!userProfile.length) {
            console.log("Error: User profile not found");
            return res
                .status(404)
                .json(new ApiError(404, "channel does not exist"));
        }
        // delete user.followers; // Remove followers array from the response

        const profile = userProfile[0];

        // Compare ObjectId strings
        const isFollowed = profile.follower.some(followerId =>
            followerId.toString() === req.user?._id.toString()
        );

        profile.isFollowed = isFollowed;
        delete profile.follower;
        
        console.log("User profile fetched successfully", profile);

        // Step 5: Return the user profile
        console.log("User profile fetched successfully");
        return res
            .status(200)
            .json(new ApiResponse(200, profile, "user profile fetched successfully"));
    } catch (error) {
        // Step 6: Log the error
        console.error("Error during user profile fetch:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while fetching User Profile", error));
    }
});


const checkUsernameExist = asyncHandler(async (req, res) => {
    const { username } = req.params;

    try {
        if (!username?.trim()) {
            return res
                .status(400)
                .json(new ApiError(400, "username is missing"));
        }

        const user = await User.findOne({ username }).select("-password")
        if (!user || !user.isVerified) {
            return res
                .status(400)
                .json(new ApiError(400, "username does not exist"))
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, `username ${user.username} exist`))
    } catch (error) {
        console.log(error)
        return res
            .status(400)
            .json(new ApiError(400, "Something went wrong while checking username exist or not", error))
    }
})


// FORGOT PASSWORD: step 1
const initiateForgotPasswordReset = asyncHandler(async (req, res) => {
    try {
        // Step 1: Get email from the request body
        const { email } = req.body;
        console.log("Step 1: Received email for password reset:", email);

        if (!email) {
            console.log("Step 1: Validation failed - email is required.");
            return res
                .status(400)
                .json(new ApiError(400, "Email is required."));
        }

        // Step 2: Find user by email
        const user = await User.findOne({ email });
        console.log("Step 2: User fetched from database:", user ? user.email : "User not found");

        if (!user) {
            console.log("Step 2: No user found for the provided email.");
            return res
                .status(404)
                .json(new ApiError(404, "User with this email does not exist."));
        }

        // Step 3: Generate verification code and expiry
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const verifyCodeExpiry = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
        console.log("Step 3: Generated verification code and expiry:", { verifyCode, verifyCodeExpiry});

        user.verifyCode = verifyCode;
        user.verifyCodeExpiry = verifyCodeExpiry;

        // Step 4: Save user with verification details
        await user.save();
        console.log("Step 4: User with updated verification details saved to database.");

        // Step 5: Send verification email
        sendVerificationEmail(user, verifyCode, "PASSWORDRESET");
        console.log("Step 5: Verification email sent successfully to:", user.email);

        // step 6. generating token
        const resetToken = generateResetToken(email);

        // Step 7: Set cookies
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "None", // For cross-site cookies
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        };
        console.log("Step 7: Cookie options set", cookieOptions);

        // Step 8: Send success response
        console.log("Step 8: Sending success response.");
        return res
            .status(200)
            .cookie("resetToken", resetToken, cookieOptions)
            .json(new ApiResponse(200, email, "Password reset OTP has been sent to your email.")
        );

    } catch (error) {
        console.log("An error occurred during the password reset process:", error);
        return res.status(500).json(
            new ApiError(500, "An unexpected error occurred. Please try again later.", error)
        );
    }
});

// FORGOT PASSWORD: step 2
const verifyCodeAndResetPassword = asyncHandler(async (req, res) => {
    try {
        // Step 1: Validate inputs
        console.log("Step 1: Validating inputs...");
        const { verifyCode, password } = req.body;
        if (!verifyCode || !password) {
            console.log("Step 1: Validation failed - Missing verifyCode or password.");
            return res
                .status(400)
                .json(new ApiError(400, "Both verifyCode and password are required."));
        }
        console.log("Step 1: Inputs validated.", {verifyCode, password});

        // Step 2: Get email from token
        console.log("Step 2: Getting email from token...");
        const email = req.userEmail;
        if (!email) {
            console.log("Step 2: Failed - No email found in token.");
            return res
                .status(401)
                .json(new ApiError(401, "Invalid session. Please try again."));
        }
        console.log("Step 2: Email extracted from token:", email);

        // Step 3: Find user by email
        console.log("Step 3: Finding user by email...");
        const user = await User.findOne({ email });
        if (!user) {
            console.log("Step 3: Failed - No user found for email:", email);
            return res
                .status(404)
                .json(new ApiError(404, "No user found with the provided email."));
        }
        console.log("Step 3: User found:", user.email);

        // Step 4: Match the verifyCode
        console.log("Step 4: Verifying the code...");
        if (user.verifyCode !== verifyCode) {
            console.log("Step 4: Failed - Verification code does not match.");
            return res
                .status(400)
                .json(new ApiError(400, "Invalid verification code."));
        }

        // Step 4.1: Check expiry
        console.log("Step 4.1: Checking verification code expiry...");
        if (user.verifyCodeExpiry < Date.now()) {
            console.log("Step 4.1: Failed - Verification code has expired.");
            return res
                .status(400)
                .json(new ApiError(400, "Verification code has expired. Please request a new one."));
        }
        console.log("Step 4: Verification code is valid.");

        // Step 4.2: Clear verifyCode and expiry
        console.log("Step 4.2: Clearing verification code and expiry...");
        user.verifyCode = null;
        user.verifyCodeExpiry = null;

        // Step 5: Update and hash password
        console.log("Step 5: Hashing and updating the password...");
        user.password = password;
        await user.save({ validateBeforeSave: false });
        console.log("Step 5: Password updated.");

        // Step 6: Save the user
        console.log("Step 6: Saving user data...");
        await user.save();
        console.log("Step 6: User saved successfully.");

        // Step 7: Clear cookies
        console.log("Step 7: Clearing reset token cookie...");
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None", // Required for cross-site cookies
            maxAge: 0, // optional
        };
        console.log("Step 7: Reset token cookie cleared.");

        // Step 8: Send success response
        console.log("Step 8: Sending success response.");
        return res
            .status(200)
            .clearCookie("resetToken", options)
            .json(new ApiResponse(200, null, "Password has been successfully updated."));
    } catch (error) {
        console.error("Error during password reset process:", error);
        return res
            .status(500)
            .json(new ApiError(500, "An unexpected error occurred. Please try again.", error));
    }
});

const getEmailForResetPassword = asyncHandler(async (req, res) =>{
    try {
        // Step 1: Get email from token
        console.log("Step 1: Getting email from token...");
        const email = req.userEmail;
        if (!email) {
            console.log("Step 1: Failed - No email found in token.");
            return res
                .status(401)
                .json(new ApiError(401, "Invalid session. Please try again."));
        }
        console.log("Step 1: Email extracted from token:", email);

        // step 2: send response
        return res
            .status(200)
            .json(new ApiResponse(200, email, "")
        );
    } catch (error) {
        console.log("An error occurred during the password reset process:", error);
        return res
            .status(500)
            .json(new ApiError(500, "An unexpected error occurred. Please try again later.", error));
    }
})

export {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    changeCurrentPassword,
    getUserProfile,
    checkUsernameExist,
    initiateForgotPasswordReset,
    verifyCodeAndResetPassword,
    getEmailForResetPassword
}
