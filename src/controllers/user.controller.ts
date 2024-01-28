import asyncHandler from "../utils/asyncHandler"
import z from "zod"
import { ApiError } from "../utils/ApiError"
import { User } from "../models/user.model"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary"
import { ApiResponse } from "../utils/ApiResponse"
import jwt from "jsonwebtoken"
import mongoose, { Mongoose } from "mongoose"
import { sendMail } from "../utils/nodemailer"
import { NextFunction, Request, Response } from "express"
import { Options } from "nodemailer/lib/mailer"
import { Files } from "../middlewares/multer.middleware"

const generateAccessTokenAndRefreshToken = async (user: any) => {
    try {
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (err) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

let registerSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6).max(30),
    fullName: z.string().min(3).max(30),
})

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body)
    if (!result.success) {
        throw new ApiError(400, "Invalid arguments", result.error)
    }
    const { username, email, password, fullName } = result.data
    const existedUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const files = req.files as Files

    const avatarLocalPath = files?.avatar?.[0]?.path
    const coverImageLocalPath = files?.coverImage?.[0]?.path

    let avatar, coverImage

    if (avatarLocalPath) {
        avatar = await uploadOnCloudinary(avatarLocalPath)
    }
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    const user = await User.create({
        username: username,
        email: email,
        password: password,
        fullName: fullName,
        avatar: avatar,
        coverImage: coverImage,
    })

    const createdUser = await User.findById(user.id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    const data: Options = {
        from: process.env.EMAIL,
        to: user?.email,
        subject: "Account Created",
        text:
            "Congratulations!! Your account has been created successfully with username " +
            user?.username +
            " and email " +
            user?.email +
            " at YOUTUBE CLONE.",
    }
    sendMail(data)

    return res
        .status(200)
        .json(new ApiResponse(201, "User created", createdUser))
})

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Please provide username or email")
    }
    if (!password) {
        throw new ApiError(400, "Please provide password")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isMatch = await user.isPasswordCorrect(password)
    if (!isMatch) {
        throw new ApiError(400, "Invalid credentials")
    }

    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user)
    const loggedInUser = await User.findById(user.id).select(
        "-password -refreshToken"
    )

    //sending cookie
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "User logged in successfully", {
                user: loggedInUser,
                accessToken,
                refreshToken,
            })
        )
})

const logoutUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        await User.findByIdAndUpdate(
            req.headers["userId"],
            { $set: { refreshToken: undefined } },
            { new: true }
        )

        //clear cookie
        const options = {
            httpOnly: true,
            secure: true,
        }
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, "User logged out successfully", {}))
    }
)

const refreshAccessToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const incomingRefreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET || "secret"
        )
        if (!decodedToken || typeof decodedToken === "string") {
            throw new ApiError(500, "Something went wrong while decoding token")
        }

        const user = await User.findById(decodedToken.id).select("-password")
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, refreshToken } =
            await generateAccessTokenAndRefreshToken(user)

        //sending cookie
        const options = {
            httpOnly: true,
            secure: true,
        }

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, "Access token refreshed successfully", {
                    accessToken,
                    refreshToken,
                })
            )
    }
)

const changeCurrentPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { currentPassword, newPassword } = req.body
        if (!currentPassword || !newPassword) {
            throw new ApiError(
                400,
                "Please provide current password and new password"
            )
        }
        const user = await User.findById(req.headers["userId"])
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Current password is incorrect")
        }
        user.password = newPassword
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(new ApiResponse(200, "Password changed successfully", {}))
    }
)

const getCurrentUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.findById(req.headers["userId"]).select(
            "-password -refreshToken"
        )
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Current user fetched successfully", user)
            )
    }
)

const updateUserDetails = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { fullName, email } = req.body
        if (!fullName || !email) {
            throw new ApiError(400, "Please provide full name and email")
        }
        const user = await User.findByIdAndUpdate(
            req.headers.userId,
            {
                $set: {
                    fullName,
                    email,
                },
            },
            { new: true }
        ).select("-password -refreshToken")

        return res
            .status(200)
            .json(
                new ApiResponse(200, "User details updated successfully", user)
            )
    }
)

const updateUserAvatar = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const avatarLocalPath = req.file?.path
        if (!avatarLocalPath) {
            throw new ApiError(400, "Please provide avatar")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        if (!avatar) {
            throw new ApiError(
                500,
                "Something went wrong while uploading avatar"
            )
        }
        const user = await User.findById(req.headers["userId"]).select(
            "-password -refreshToken"
        )
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        await deleteFromCloudinary(user.avatar?.publicId)

        user.avatar = avatar
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(
                new ApiResponse(200, "User avatar updated successfully", user)
            )
    }
)

const updateUserCoverImage = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const coverImageLocalPath = req.file?.path
        if (!coverImageLocalPath) {
            throw new ApiError(400, "Please provide Cover Image")
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!coverImage)
            throw new ApiError(
                500,
                "Something went wrong while uploading cover image"
            )

        const user = await User.findById(req.headers["userId"]).select(
            "-password -refreshToken"
        )
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        await deleteFromCloudinary(user?.coverImage?.publicId)

        user.coverImage = coverImage
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "User cover image updated successfully",
                    user
                )
            )
    }
)

const userChannelProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params
        console.log(username)
        if (!username.trim()) {
            throw new ApiError(400, "Please provide username")
        }

        //writing aggregation pipelines
        const channel = await User.aggregate([
            {
                $match: {
                    username: username?.toLowerCase(),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "id",
                    foreignField: "subscriber",
                    as: "subscribedTo",
                },
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers",
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo",
                    },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [
                                    req.headers["userId"],
                                    "$subscribers.subscriber",
                                ],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,
                },
            },
        ])
        if (!channel?.length) {
            throw new ApiError(404, "Channel not found")
        }

        console.log(channel)

        return res
            .status(200)
            .json(new ApiResponse(200, "User channel fetched", channel[0]))
    }
)

const getWatchHistory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.headers["userId"]
        if (!userId || typeof userId !== "string") {
            throw new ApiError(400, "Please provide user id")
        }
        const user = await User.aggregate([
            {
                $match: {
                    id: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            fullName: 1,
                                            avatar: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $addFields: {
                                owner: { $first: "$owner" },
                            },
                        },
                    ],
                },
            },
        ])

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Watch history fetched successfully",
                    user[0]?.watchHistory
                )
            )
    }
)

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    userChannelProfile,
    getWatchHistory,
}
