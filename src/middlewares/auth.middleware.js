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
            throw new ApiError("Unauthorized request", 404)
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decodedToken) {
            throw new ApiError("Something went wrong while decoding token", 500)
        }

        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        )
        if (!user) {
            throw new ApiError("Invalid access token", 401)
        }

        //setting user in req.user
        req.user = user
        next()
    } catch (error) {
        throw new ApiError("Invalid access token", 401)
    }
})
