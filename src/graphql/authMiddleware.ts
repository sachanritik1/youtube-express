import { NextFunction, Response, Request } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model"

export const graphqlAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        console.log("GraphQL Auth Middleware triggered")
        const query = req.body?.query || ""

        // Skip auth for login and register operations
        if (
            query.includes("login") ||
            query.includes("register") ||
            query.includes("refreshToken")
        ) {
            return next()
        }

        // For GraphQL operations, handle auth directly
        const token =
            req?.cookies?.accessToken ||
            req?.headers?.authorization?.split(" ")[1]

        if (!token) {
            // Instead of throwing error, we'll let the resolver handle auth
            return next()
        }

        try {
            // Verify token
            const decodedToken = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET || "secret"
            )

            if (decodedToken && typeof decodedToken === "object") {
                const user = await User.findById(decodedToken.id).select(
                    "-password -refreshToken"
                )

                if (user) {
                    // Set user on the request object
                    req.user = {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        fullName: user.fullName,
                    }
                    req.headers["userId"] = user.id
                }
            }
        } catch (tokenError) {
            // Don't throw an error for invalid tokens here, just don't set the user
            // Resolvers will handle authentication checks
            console.log(
                "Token verification failed:",
                (tokenError as Error).message
            )
        }

        return next()
    } catch (error) {
        // Don't pass errors to next() as they won't be properly handled by Apollo Server
        // Just log them and continue
        console.error("Auth middleware error:", error)
        return next()
    }
}
