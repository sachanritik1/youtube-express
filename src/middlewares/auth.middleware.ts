import asyncHandler from "../utils/asyncHandler"
import { ApiError } from "../utils/ApiError"
import { IUser, User } from "../models/user.model"
import jwt from "jsonwebtoken"
import { NextFunction, Request } from "express"

export interface MyRequest extends Request {
    user: IUser
}

export const verifyJWT = asyncHandler(
    async (req: MyRequest, _: Response, next: NextFunction) => {
        try {
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
                throw new ApiError(
                    500,
                    "Something went wrong while decoding token"
                )
            }

            const user = await User.findById(decodedToken.id).select(
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
    }
)
