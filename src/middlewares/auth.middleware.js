// middlewares/auth.middleware.js
import Jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const verifyToken = asyncHandler(async (req, res, next) =>{
    try {
        // get the user from the session or jwt token and add id to req object
        // console.log("checking in cookies");
        // console.log(req.cookies);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // const token = req.cookies?.accessToken 
        // console.log("token", {token})
        if(!token){
            return res
            .status(401)
            .json(new ApiError(401, "Please authenticate using a valid token"))
        }
    
        // verify token 
        const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decodedToken
        // console.log("decodedToken", {decodedToken})
        next();

    } 
    catch(error){
        return res
        .status(500)
        .json(new ApiError(500, "Some error has occured or Please authenticate using a valid token ", error))
    }
})


const VerifyResetToken = asyncHandler(async (req, res, next) => {
    try {
        // console.log("searching in cookie.", req.cookies)
        // Step 1: Retrieve the token from cookies or Authorization header
        const token = req.cookies?.resetToken || req.header("Authorization")?.replace("Bearer ", "");
        // console.log("token", {token})

        if (!token) {
            return res
                .status(401)
                .json(new ApiError(401, "Missing token. Please provide a valid reset token to proceed."));
        }

        // Step 2: Verify the token
        const decodedToken = Jwt.verify(token, process.env.RESET_TOKEN_SECRET);

        // Step 3: Validate token type/scope
        if (decodedToken.type !== "PASSWORDRESET") {
            return res
                .status(401)
                .json(new ApiError(401, "Invalid token type. Please use a valid password reset token."));
        }
        // console.log("decodedToken", decodedToken);

        // Step 4: Attach email to req object
        req.userEmail = decodedToken.email;

        // Step 5: Proceed to the next middleware or controller
        next();
    } catch (error) {
        // Step 6: Handle specific token errors
        if (error.name === "TokenExpiredError") {
            return res
                .status(401)
                .json(new ApiError(401, "Your reset token has expired. Please request a new one."));
        } else if (error.name === "JsonWebTokenError") {
            return res
                .status(401)
                .json(new ApiError(401, "Invalid reset token. Please authenticate using a valid token."));
        }

        // Generic error handler
        return res
            .status(500)
            .json(new ApiError(500, "An unexpected error occurred while verifying your token.", error));
    }
});


export {
    verifyToken,
    VerifyResetToken
}