import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

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

    const user = User.findById(decodedToken._id).select("-password")
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

export { registerUser, loginUser, logoutUser, refreshAccessToken }
