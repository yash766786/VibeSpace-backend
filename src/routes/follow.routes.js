import { Router } from 'express';
import {
    toggleFollowUser,
    getFollowers,
    getFollowings
} from "../controllers/follow.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyToken); // Apply verifyToken middleware to all routes in this file

router.route("/toggle/u/:username").get(toggleFollowUser);
router.get('/u/:username/followers', getFollowers);
router.get('/u/:username/followings', getFollowings);

export default router