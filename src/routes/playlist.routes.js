import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    createPlaylist,
    getPlaylist,
    deletePlaylist,
    updatePlaylist,
    addVideoToPlaylist,
} from "../controllers/playlist.controller.js"

const playlistRouter = Router()

playlistRouter.use(verifyJWT)

playlistRouter.route("/").post(createPlaylist)

playlistRouter
    .route("/:playlistId")
    .get(getPlaylist)
    .delete(deletePlaylist)
    .patch(updatePlaylist)

playlistRouter.route("/:playlistId/videos").patch(addVideoToPlaylist)

export default playlistRouter
