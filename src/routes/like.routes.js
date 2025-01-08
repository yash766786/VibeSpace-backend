import { Router } from 'express';
import {
    getPostLikes,
    togglePostLike,
    toggleCommentLike
} from "../controllers/like.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyToken); // Apply verifyToken middleware to all routes in this file

router.route("/:postId").get(getPostLikes)
router.route("/toggle/p/:postId").post(togglePostLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);

export default router