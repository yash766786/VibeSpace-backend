
###
// const registerUser = asyncHandler(async (req, res) => {
    // // 1. get user detail
    // // 2. check all fields -> username, email, fullname, password
    // // 3. check for images -> avatar
    // // 4. check existedUserByEmail
    // //     # if verifed-> return email already exist
    // //     # if not verified -> delete object existeduserbyemail for making new object for this user
    // //                        also destroy the avatar from cloudinary
    // // 5. check existedUserByUsername
    // //     # if verifed-> return username already exist
    // //     # if not verified -> delete object existedUserByUsername for making new object for this user
    // //                        also destroy the avatar from cloudinary
    // // 6. upload avatar on cloudinary for new user
    // // 7. generate random code of 6 length
    // // 8. create user object - create entry in db
    // // 9. check for user creation successfully or not and remove password field
    // // 10. Generate access token
    // // 11. Send email with verification code (we will verify email through otp)
    // // 12. set cookies
    // // 13. send response 

//     // get user detail
//     const { username, email, fullname, password } = req.body
//     const avatarLocalPath = req.file?.path;

//     // validate - not empty
//     try {
//         if ([username, email, fullname, password].some((field) => field.trim() === "")) {
//             return res
//                 .status(400)
//                 .json(new ApiError(400, "All fields are required"))
//         }

//         // check for images: avatar
//         if (!avatarLocalPath) {
//             return res
//                 .status(400)
//                 .json(new ApiError(400, "Avatar file is required"))
//         }

//         console.log("1......")
//         // check if email already exist with verified user
//         const existedUserByEmail = await User.findOne({ email: email })
//         // console.log(existedUserByEmail)
//         if (existedUserByEmail){
//             return res
//                 .status(409)
//                 .json(new ApiError(409, "User with this email already exists"))
//         }


//         console.log("2......")
//         // check if username already exist with verified user
//         const existedUserByUsername = await User.findOne({ username: username })
//         if (existedUserByUsername) {
//             return res
//                 .status(409)
//                 .json(new ApiError(409, "User with this username already exists"))
//         }

//         console.log("3......")
//         // upload avatar to cloudinary
//         const avatar = await uploadOnCloudinary(avatarLocalPath);
//         if (!avatar) {
//             return res
//                 .status(400)
//                 .json(new ApiError(400, "Avatar file is not uploaded on cloudinary-----"))
//         }
//         console.log(avatar);

//         console.log("4......")
//         // create user object - create entry in db
//         const user = await User.create({
//             username: username.toLowerCase(),
//             email,
//             fullname,
//             password,
//             avatar: avatar.url
//         })
//         // sendVerificationEmail(user,)
//         console.log("user....", user)

//         console.log("5......")
//         // check for user creation and remove password field
//         const createdUser = await User.findById(user._id).select("-password")
//         if (!createdUser) {
//             return res
//                 .status(500)
//                 .json(new ApiError(500, "Something went wrong while registering the user"))
//         }

//         // Generate access token
//         const accessToken = await generateAccessToken(user)
//         console.log(accessToken)

//         console.log("6......")
//         // Send email with verification link
//         sendVerificationEmail(user, accessToken);

//         // set cookie
//         const options = {
//             httpOnly: true,
//             secure: true,
//             sameSite: "None",  // Required for cross-site cookies
//             maxAge: 1000 * 60 * 60 * 24 // expiry in 1 day
//         }

//         console.log("7......")
//         console.log(accessToken)
//         // send response
//         return res
//             .status(201)
//             .cookie("accessToken", accessToken, options)
//             .json(new ApiResponse(201, createdUser, "Verification email sent"))
//     }
//     catch (error) {
//         return res
//             .status(500)
//             .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
//     }

// })


// const registerUser = asyncHandler(async (req, res) => {

//     // get user detail
//     const { username, email, fullname, password } = req.body
//     const avatarLocalPath = req.file?.path;

//     // validate - not empty
//     try {
//         if ([username, email, fullname, password].some((field) => field.trim() === "")) {
//             return res
//                 .status(400)
//                 .json(new ApiError(400, "All fields are required"))
//         }

//         // check for images: avatar
//         if (!avatarLocalPath) {
//             return res
//                 .status(400)
//                 .json(new ApiError(400, "Avatar file is required"))
//         }

//         console.log("1......")
//         // check if email already exist with verified user
//         const existedUserByEmail = await User.findOne({ email: email })
//         // console.log(existedUserByEmail)
//         if (existedUserByEmail){
//             return res
//                 .status(409)
//                 .json(new ApiError(409, "User with this email already exists"))
//         }


//         console.log("2......")
//         // check if username already exist with verified user
//         const existedUserByUsername = await User.findOne({ username: username })
//         if (existedUserByUsername) {
//             return res
//                 .status(409)
//                 .json(new ApiError(409, "User with this username already exists"))
//         }

//         console.log("3......")
//         // upload avatar to cloudinary
//         const avatar = await uploadOnCloudinary(avatarLocalPath);
//         if (!avatar) {
//             return res
//                 .status(400)
//                 .json(new ApiError(400, "Avatar file is not uploaded on cloudinary-----"))
//         }
//         console.log(avatar);

//         console.log("4......")
//         // create user object - create entry in db
//         const user = await User.create({
//             username: username.toLowerCase(),
//             email,
//             fullname,
//             password,
//             avatar: avatar.url
//         })
//         // sendVerificationEmail(user,)
//         console.log("user....", user)

//         console.log("5......")
//         // check for user creation and remove password field
//         const createdUser = await User.findById(user._id).select("-password")
//         if (!createdUser) {
//             return res
//                 .status(500)
//                 .json(new ApiError(500, "Something went wrong while registering the user"))
//         }

//         // Generate access token
//         const accessToken = await generateAccessToken(user)
//         console.log(accessToken)

//         console.log("6......")
//         // Send email with verification link
//         sendVerificationEmail(user, accessToken);

//         // set cookie
//         const options = {
//             httpOnly: true,
//             secure: true,
//             sameSite: "None",  // Required for cross-site cookies
//             maxAge: 1000 * 60 * 60 * 24 // expiry in 1 day
//         }

//         console.log("7......")
//         console.log(accessToken)
//         // send response
//         return res
//             .status(201)
//             .cookie("accessToken", accessToken, options)
//             .json(new ApiResponse(201, createdUser, "Verification email sent"))
//     }
//     catch (error) {
//         return res
//             .status(500)
//             .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
//     }

// })


###
// const verifyEmail = asyncHandler(async (req, res) => {
    

//     // Get the user ID from the token
//     const userId = req.user?._id

//     try {
//         // Find the user and set their email as verified
//         const user = await User.findByIdAndUpdate(userId, { isVerified: true }).select("-password");

//         return res
//             .status(200)
//             .json(new ApiResponse(200, user, "Email verified successfully"))
//     } catch (error) {
//         return res
//             .status(500)
//             .json(new ApiError(500, "Something went wrong while Email verification", error));
//     }
// })


###
// const loginUser = asyncHandler(async (req, res) => {
//     // 1. get login details -> username, email, password
//     // 2. check validation -> need anyone field(username or email) and password
//     // 3. find the user
//     // 4. check user is verified or not 
//     // 5. check password
//     // 6. generate access token
//     // 7. set cookies
//     // 8. send response

//     // get login details
//     const { username, email, password } = req.body

//     // check validation
//     if (!username && !email) {
//         return res
//             .status(400)
//             .json(new ApiError(400, "Email and Password both required"))
//     }

//     if (!password) {
//         return res
//             .status(400)
//             .json(new ApiError(400, "Password is required"))
//     }

//     try {
//         // find the user
//         const user = await User.findOne({
//             $or: [{ username }, { email }]
//         })
//         if (!user) {
//             return res
//                 .status(404)
//                 .json(new ApiError(404, "User does not exist"))
//         }

//         // check password
//         const verifyPassword = await user.verifyPassword(password)
//         if (!verifyPassword) {
//             return res
//                 .status(400)
//                 .json(new ApiError(400, "Invalid password"))
//         }

//         const loggedInUser = await User.findById(user._id).select("-password")

//         // generate access token
//         const accessToken = await generateAccessToken(user)
//         console.log("accessToken")
//         console.log(accessToken)

//         // set cookie
//         const options = {
//             httpOnly: true,
//             secure: true,
//             sameSite: "None",  // Required for cross-site cookies
//             maxAge: 1000 * 60 * 60 * 24 // expire in 1 day
//         }

//         // send response
//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, options)
//             .json(new ApiResponse(200, loggedInUser, "User logged in successfully"))

//     }
//     catch (error) {
//         return res
//             .status(500)
//             .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
//     }

// })


###
// const getCurrentUser = asyncHandler(async (req, res) => {
    

//     // Get the user ID from the token
//     const userId = req.user._id;

//     try {
//         // Fetch user details from the database
//         const user = await User.findById(userId).select("-password");

//         if (!user) {
//             return res
//                 .status(404)
//                 .json(new ApiError(404, "User not found"));
//         }

//         // if (user.isVerified){
//         //     return res
//         //         .status(404)
//         //         .json(new ApiError(404, "User is not verified with this email"));
//         // }

//         return res
//             .status(200)
//             .json(new ApiResponse(200, user, "current user fetched successfully"))
//     }
//     catch (error) {
//         console.log(error)
//         return res
//             .status(500)
//             .json(new ApiError(500, "Something went wrong while fetching the user details", error))
//     }
// })


###
// const getUserProfile = asyncHandler(async (req, res) => {
//     const { username } = req.params;

//     // Step 1: Check if the username is valid
//     if (!username?.trim()) {
//         console.log("Error: Username is missing");
//         return res.status(400).json(new ApiError(400, "username is missing"));
//     }

//     try {
//         console.log(`Fetching profile for username: ${username.toLowerCase()}`);

//         // Step 2: Aggregate user profile data
//         const userProfile = await User.aggregate([
//             {
//                 $match: {
//                     username: username.toLowerCase()
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "follows",
//                     localField: "_id",
//                     foreignField: "following",
//                     as: "followers"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "follows",
//                     localField: "_id",
//                     foreignField: "follower",
//                     as: "following"
//                 }
//             },
//             {
//                 $addFields: {
//                     followerCount: { $size: "$followers" },
//                     followingCount: { $size: "$following" },
//                     // isFollowed: {
//                     //     $in: [
//                     //         req.user?._id,
//                     //         {
//                     //             $map: {
//                     //                 input: "$followers",
//                     //                 as: "follower",
//                     //                 in: "$$follower.follower"
//                     //             }
//                     //         }
//                     //     ]
//                     // }
//                     isFollowed : {
//                         $cond: {
//                             // if: { $in: [req.user?._id, "$follower.follower"] },
//                             if: { $in: [req.user?._id, 
//                                 {
//                                                 $map: {
//                                                     input: "$followers",
//                                                     as: "follower",
//                                                     in: "$$follower.follower"
//                                                 }
//                                             }
//                             ] },
//                             then: true,
//                             else: false,
//                         },
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     fullname: 1,
//                     username: 1,
//                     followerCount: 1,
//                     followingCount: 1,
//                     isFollowed: 1,
//                     avatar: 1,
//                     email: 1
//                 }
//             }
//         ]);

//         // Step 3: Log the aggregation result
//         console.log("Aggregation result:", userProfile);

//         // Step 4: Handle case where no profile is found
//         if (!userProfile.length) {
//             console.log("Error: User profile not found");
//             return res
//                 .status(404)
//                 .json(new ApiError(404, "channel does not exist"));
//         }

//         // Step 5: Return the user profile
//         console.log("User profile fetched successfully");
//         return res
//             .status(200)
//             .json(new ApiResponse(200, userProfile, "user profile fetched successfully"));
//     } catch (error) {
//         // Step 6: Log the error
//         console.error("Error during user profile fetch:", error);
//         return res
//             .status(500)
//             .json(new ApiError(500, "Something went wrong while fetching User Profile", error));
//     }
// });




###
// const getUserProfile = asyncHandler(async (req, res) => {
//     const { username } = req.params;

//     if (!username?.trim()) {
//         return res.status(400).json(new ApiError(400, "username is missing", error));
//     }

//     try {
//         const userProfile = await User.aggregate([
//             {
//                 $match: {
//                     username: username.toLowerCase()
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "follows",
//                     localField: "_id",
//                     foreignField: "following",
//                     as: "followers"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "follows",
//                     localField: "_id",
//                     foreignField: "follower",
//                     as: "following"
//                 }
//             },
//             {
//                 $addFields: {
//                     followerCount: { $size: "$followers" },
//                     followingCount: { $size: "$following" },
//                     isFollowed: {
//                         $in: [req.user?._id, "$followers.follower"]
//                     },
//                     follower: "$followers.follower"
//                 }
//             },
//             {
//                 $project: {
//                     fullname: 1,
//                     username: 1,
//                     followerCount: 1,
//                     followingCount: 1,
//                     isFollowed: 1,
//                     avatar: 1,
//                     email: 1,
//                     follower: 1
//                 }
//             }
//         ]);

//         if (!userProfile.length) {
//             return res
//                 .status(404)
//                 .json(new ApiError(404, "channel does not exists"));
//         }
//         console.log(userProfile)

//         return res
//             .status(200)
//             .json(new ApiResponse(200, userProfile, "user profile fetched successfully"));
//     } catch (error) {
//         console.log(error);
//         return res
//             .status(500)
//             .json(new ApiError(500, "Something went wrong while fetching User Profile", error));
//     }
// });

###
