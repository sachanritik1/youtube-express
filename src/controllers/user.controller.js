import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

export const registerUser = asyncHandler(async (req, res, next) => {
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
