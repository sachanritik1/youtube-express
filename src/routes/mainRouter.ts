import { Router } from "express"
import userRouter from "./user.routes"
import videoRouter from "./video.routes"
import commentRouter from "./comment.routes"
import likeRouter from "./like.routes"
import playlistRouter from "./playlist.routes"

const router = Router()

router.use("/users", userRouter)
router.use("/videos", videoRouter)
router.use("/comments", commentRouter)
router.use("/likes", likeRouter)
router.use("/playlists", playlistRouter)

export default router
