import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req?.cookies?.accessToken ||
            req?.headers?.authorization?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(404, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decodedToken) {
            throw new ApiError(500, "Something went wrong while decoding token")
        }

        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        )
        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }

        //setting user in req.user
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid access token")
    }
})
