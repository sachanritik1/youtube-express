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
    userChannelProfile,
    getWatchHistory,
    updateUserDetails,
} from "../controllers/user.controller"
import { upload } from "../middlewares/multer.middleware"
import { verifyJWT } from "../middlewares/auth.middleware"

const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
)
userRouter.route("/login").post(loginUser)
userRouter.route("/refresh-token").post(refreshAccessToken) //no need to verifyJWT because we are not using accessToken here

//securing routes
userRouter.use(verifyJWT)
//secured routes
userRouter.route("/me").get(getCurrentUser)
userRouter.route("/logout").get(logoutUser)
userRouter.route("/change-password").post(changeCurrentPassword)
userRouter.route("/update-user").patch(updateUserDetails)
userRouter
    .route("/update-avatar")
    .patch(upload.single("avatar"), updateUserAvatar)
userRouter
    .route("/update-cover-image")
    .patch(upload.single("coverImage"), updateUserCoverImage)
userRouter.route("/user/:username").get(userChannelProfile)
userRouter.route("/watch-history").get(getWatchHistory)

export default userRouter
