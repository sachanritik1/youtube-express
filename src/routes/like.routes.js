import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    likeVideo,
    unlikeVideo,
    likeTweet,
    unlikeTweet,
} from "../controllers/like.controller.js"

const likeRouter = Router()

likeRouter.use(verifyJWT)

likeRouter.route("/l/:videoId").post(likeVideo).delete(unlikeVideo)
likeRouter.route("/l/:tweetId").post(likeTweet).delete(unlikeTweet)

export default likeRouter
