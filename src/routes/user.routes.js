import { Router } from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
)
userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken) //no need to verifyJWT because we are not using accessToken here
userRouter
    .route("/change-current-password")
    .post(verifyJWT, changeCurrentPassword)
userRouter.route("/get-current-user").get(verifyJWT, getCurrentUser)
userRouter
    .route("/update-avatar")
    .post(
        verifyJWT,
        upload.fields([{ name: "avatar", maxCount: 1 }]),
        updateUserAvatar
    )
userRouter
    .route("/update-cover-image")
    .post(
        verifyJWT,
        upload.fields([{ name: "coverImage", maxCount: 1 }]),
        updateUserCoverImage
    )

export default userRouter
