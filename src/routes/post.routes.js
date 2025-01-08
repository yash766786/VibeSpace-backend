import { Router } from 'express';
import {
    getAllPosts,
    getPostById,
    publishPost,
    updatePost,
    deletePost,
    getPostsByUsername
} from "../controllers/post.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { checkAborted } from '../middlewares/abortedRequest.middleware.js';

const router = Router();

// Apply verifyToken middleware to all routes in this file
router.use(verifyToken);

router.route("/")
    .get(getAllPosts) // Fetch all posts
    .post(
        upload.single("postFile"),
         checkAborted,
          publishPost
        );

// Use 'postId' for better clarity
router.route("/:postId")
    .get(getPostById) // Fetch post by ID
    .patch(updatePost) // Update post
    .delete(deletePost); // Delete post

router.route("/p/:username")
        .get(getPostsByUsername)

export default router;
