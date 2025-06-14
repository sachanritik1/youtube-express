import asyncHandler from "../utils/asyncHandler"
import { ApiError } from "../utils/ApiError"
import { NextFunction, Response, Request } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model"

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string
                email?: string
                username?: string
                fullName?: string
            }
        }
    }
}

export const verifyJWT = asyncHandler(
    async (req: Request, _: Response, next: NextFunction) => {
        try {
            const token =
                req?.cookies?.accessToken ||
                req?.headers?.authorization?.split(" ")[1]
            // console.log(token)

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

            // Set user on the request object
            req.user = {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
            }

            req.headers["userId"] = user.id
            next()
        } catch (error) {
            throw new ApiError(401, "Invalid access token")
        }
    }
)
