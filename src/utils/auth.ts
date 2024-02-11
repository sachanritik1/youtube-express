import jwt from "jsonwebtoken"
import { Request } from "express"
import { User } from "../models/user.model"
import { ApiError } from "./ApiError"

export const verifyUser = async function (req: Request) {
    const token =
        req?.cookies?.accessToken ||
        req?.headers?.authorization?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(404, "Unauthorized request")
    }

    const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || "secret"
    )

    if (!decodedToken || typeof decodedToken === "string") {
        throw new ApiError(500, "Something went wrong while decoding token")
    }

    const user = await User.findById(decodedToken.id).select(
        "-password -refreshToken"
    )
    if (!user) {
        throw new ApiError(401, "Invalid access token")
    }
    req.headers["userId"] = user.id
}
