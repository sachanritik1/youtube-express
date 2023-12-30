import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { SUBSCRIPTION_DB, USER_DB, VIDEO_DB } from "../constants.js"
import mongoose from "mongoose"

const generateAccessTokenAndRefreshToken = async (user) => {
    try {
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (err) {
        throw new ApiError("Something went wrong while generating tokens", 500)
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body
    if (
        [username, email, password, fullName].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError("Please fill in all fields", 400)
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existedUser) {
        throw new ApiError("User already exists", 409)
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    let avatarUrl = "",
        coverImageUrl = ""
    if (avatarLocalPath) {
        avatarUrl = await uploadOnCloudinary(avatarLocalPath, "avatars")
    }
    if (coverImageLocalPath) {
        coverImageUrl = await uploadOnCloudinary(
            coverImageLocalPath,
            "coverImages"
        )
    }

    const user = await User.create({
        username: username,
        email: email,
        password: password,
        fullName: fullName,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError("Something went wrong while registering user", 500)
    }

    return res
        .status(200)
        .json(new ApiResponse("User created", createdUser, 201))
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError("Please provide username or email", 400)
    }
    if (!password) {
        throw new ApiError("Please provide password", 400)
    }

    const user = await User.findOne({ $or: [{ username }, { email }] })
    if (!user) {
        throw new ApiError("User not found", 404)
    }

    const isMatch = await user.isPasswordCorrect(password)
    if (!isMatch) {
        throw new ApiError("Invalid credentials", 400)
    }

    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user)
    const loggedInUser = await User.findById(user._id).select(
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
            new ApiResponse(
                "User logged in successfully",
                { user: loggedInUser, accessToken, refreshToken },
                200
            )
        )
})

const logoutUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(
        req.user._id,
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
        .json(new ApiResponse("User logged out successfully", {}, 200))
})

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError("Unauthorized request", 401)
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )
    if (!decodedToken) {
        throw new ApiError("Something went wrong while decoding token", 500)
    }

    const user = await User.findById(decodedToken._id).select("-password")
    if (!user) {
        throw new ApiError("Invalid refresh token", 401)
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError("Refresh token is expired or used", 401)
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
            new ApiResponse(
                "Access token refreshed successfully",
                { accessToken, refreshToken },
                200
            )
        )
})

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
        throw new ApiError("Please provide current password and new password")
    }
    const user = await User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)
    if (!isPasswordCorrect) {
        throw new ApiError("Current password is incorrect", 400)
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse("Password changed successfully", {}, 200))
})

const getCurrentUser = asyncHandler(async (req, res, next) => {
    return res
        .status(200)
        .json(
            new ApiResponse("Current user fetched successfully", req.user, 200)
        )
})

const updateUserDetails = asyncHandler(async (req, res, next) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new ApiError("Please provide full name and email", 400)
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
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
        .json(new ApiResponse("User details updated successfully", user, 200))
})

const updateUserAvatar = asyncHandler(async (req, res, next) => {
    //TODO :delete old avatar from cloudinary
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError("Please provide avatar", 400)
    }

    const avatarUrl = await uploadOnCloudinary(avatarLocalPath, "avatars")

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatarUrl,
            },
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse("User avatar updated successfully", user, 200))
})

const updateUserCoverImage = asyncHandler(async (req, res, next) => {
    //TODO :delete old avatar from cloudinary
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError("Please provide Cover Image", 400)
    }

    const coverImageUrl = await uploadOnCloudinary(
        coverImageLocalPath,
        "avatars"
    )

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImageUrl,
            },
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse("User cover image updated successfully", user, 200)
        )
})

const userChannelProfile = asyncHandler(async (req, res, next) => {
    const { username } = req.params
    if (!username.trim()) {
        throw new ApiError("Please provide username", 400)
    }

    //writing aggregation pipelines
    const channel = User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
            $lookup: {
                from: SUBSCRIPTION_DB,
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: SUBSCRIPTION_DB,
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $if: { $in: [req.user._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false,
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribedToCount: 1,
                subscribersCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                createdAt: 1,
            },
        },
    ])
    if (!channel?.length) {
        throw new ApiError("Channel not found", 404)
    }

    console.log(channel)

    return res
        .status(200)
        .json(new ApiResponse("User channel fetched", channel[0], 200))
})

const getWatchHistory = asyncHandler(async (req, res, next) => {
    const user = User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: VIDEO_DB,
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: USER_DB,
                            localField: "owner",
                            foreignField: "_id",
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
                "Watch history fetched successfully",
                user[0]?.watchHistory,
                200
            )
        )
})

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
