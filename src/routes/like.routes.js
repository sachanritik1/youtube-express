import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const likeRouter = Router()

likeRouter.use(verifyJWT)

likeRouter.route("/l/:videoId").post(likeVideo).delete(unlikeVideo)
likeRouter.route("/l/:tweetId").post(likeTweet).delete(unlikeTweet)
