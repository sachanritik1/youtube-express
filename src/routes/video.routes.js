import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    getAllVideos,
    publishAVideo,
    getVideo,
    updateVideo,
    togglePublishStatus,
    deleteVideo,
} from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const videoRoute = Router()

videoRoute.use(verifyJWT)

videoRoute
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        publishAVideo
    )
videoRoute
    .route("/:videoId")
    .get(getVideo)
    .patch(upload.single("thumbnail"), updateVideo)
    .delete(deleteVideo)
videoRoute.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default videoRoute
