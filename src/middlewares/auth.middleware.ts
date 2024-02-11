import asyncHandler from "../utils/asyncHandler"
import { ApiError } from "../utils/ApiError"
import { NextFunction, Request } from "express"
import { verifyUser } from "../utils/auth"

export const verifyJWT = asyncHandler(
    async (req: Request, _: Response, next: NextFunction) => {
        try {
            await verifyUser(req)
        } catch (error) {
            throw new ApiError(401, "Invalid access token")
        }
    }
)
