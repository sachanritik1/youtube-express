import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import {
    getVideoComments,
    createComment,
    deleteComment,
    updateComment,
    replyComment,
    getComment,
} from "../controllers/comment.controller"
const commentRouter = Router()

commentRouter.use(verifyJWT)
commentRouter.route("/:videoId").get(getVideoComments).post(createComment)
commentRouter
    .route("/c/:commentId")
    .get(getComment)
    .delete(deleteComment)
    .patch(updateComment)
commentRouter.route("/reply/:commentId").post(replyComment)

export default commentRouter
