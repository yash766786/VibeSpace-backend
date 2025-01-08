import { Router } from "express";
import { 
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
} from "../controllers/user.controller.js";
import { verifyToken, VerifyResetToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(upload.single("avatar"), registerUser)
router.route("/login").post(loginUser)

// secured routes
router.route('/verify-email').post(verifyToken, verifyEmail);
router.route("/logout").get(verifyToken, logoutUser)
router.route("/current-user").get(verifyToken, getCurrentUser)
router.route("/update-account").patch(verifyToken, updateAccountDetails)
router.route("/avatar").patch(verifyToken, upload.single("avatar"), updateUserAvatar)
router.route("/change-password").patch(verifyToken, changeCurrentPassword)

// for all user
router.route("/check-username/:username").get(verifyToken, checkUsernameExist)
router.route("/u/:username").get(verifyToken, getUserProfile)

// forgot password
router.route("/forgot-password-reset").post(initiateForgotPasswordReset)
router.route("/reset-password").post(VerifyResetToken, verifyCodeAndResetPassword)
router.route("/reset-password-email").get(VerifyResetToken, getEmailForResetPassword)

export default router