import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    getVideoComments,
    createComment,
    deleteComment,
    updateComment,
    replyComment,
} from "../controllers/comment.controller.js"
const commentRouter = Router()

commentRouter.use(verifyJWT)
commentRouter.route("/:videoId").get(getVideoComments).post(createComment)
commentRouter.route("/c/:commentId").delete(deleteComment).patch(updateComment)
commentRouter.route("/reply/:commentId").post(replyComment)

export default commentRouter
