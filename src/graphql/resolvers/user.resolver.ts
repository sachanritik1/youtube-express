import { User } from "../../models/user.model"
import { ApiError } from "../../utils/ApiError"
import {
    GraphQLResolverContext,
    JwtPayload,
    ResolverArgs,
    ResolverParent,
} from "../types"
import jwt from "jsonwebtoken"

export const userResolvers = {
    Query: {
        me: async (
            _: ResolverParent,
            __: ResolverArgs,
            context: GraphQLResolverContext
        ) => {
            try {
                const userId = context.user?.id || context.req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const user = await User.findById(userId).select(
                    "-password -refreshToken"
                )
                if (!user) {
                    throw new ApiError(404, "User not found")
                }

                return user
            } catch (error) {
                throw error
            }
        },

        getUser: async (
            _: ResolverParent,
            { username }: { username: string }
        ) => {
            try {
                const user = await User.findOne({ username }).select(
                    "-password -refreshToken"
                )
                if (!user) {
                    throw new ApiError(404, "User not found")
                }

                return user
            } catch (error) {
                throw error
            }
        },

        getWatchHistory: async (
            _: ResolverParent,
            __: ResolverArgs,
            context: GraphQLResolverContext
        ) => {
            try {
                const userId = context.user?.id || context.req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const user = await User.findById(userId).populate({
                    path: "watchHistory",
                    populate: {
                        path: "owner",
                    },
                })

                if (!user) {
                    throw new ApiError(404, "User not found")
                }

                return user.watchHistory || []
            } catch (error) {
                throw error
            }
        },
    },

    Mutation: {
        register: async (
            _: ResolverParent,
            {
                username,
                email,
                fullName,
                password,
            }: {
                username: string
                email: string
                fullName: string
                password: string
            }
        ) => {
            try {
                const existedUser = await User.findOne({
                    $or: [{ username }, { email }],
                })
                if (existedUser) {
                    throw new ApiError(409, "User already exists")
                }

                const user = await User.create({
                    username: username.toLowerCase(),
                    email,
                    fullName,
                    password,
                })

                const { accessToken, refreshToken } =
                    await generateAccessTokenAndRefreshToken(user)

                return {
                    accessToken,
                    refreshToken,
                    user,
                }
            } catch (error) {
                throw error
            }
        },

        login: async (
            _: ResolverParent,
            {
                username,
                email,
                password,
            }: {
                username?: string
                email?: string
                password: string
            }
        ) => {
            try {
                if (!username && !email) {
                    throw new ApiError(400, "Username or email is required")
                }

                const user = await User.findOne({
                    $or: [{ username }, { email }],
                })

                if (!user) {
                    throw new ApiError(404, "User does not exist")
                }

                const isPasswordValid = await user.isPasswordCorrect(password)
                if (!isPasswordValid) {
                    throw new ApiError(401, "Invalid user credentials")
                }

                const { accessToken, refreshToken } =
                    await generateAccessTokenAndRefreshToken(user)

                const loggedInUser = await User.findById(user._id).select(
                    "-password -refreshToken"
                )

                return {
                    accessToken,
                    refreshToken,
                    user: loggedInUser,
                }
            } catch (error) {
                throw error
            }
        },

        logout: async (
            _: ResolverParent,
            __: ResolverArgs,
            context: GraphQLResolverContext
        ) => {
            try {
                const userId = context.user?.id || context.req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                await User.findByIdAndUpdate(userId, {
                    $unset: {
                        refreshToken: 1,
                    },
                })

                return true
            } catch (error) {
                throw error
            }
        },

        refreshToken: async (
            _: ResolverParent,
            { refreshToken }: { refreshToken: string }
        ) => {
            try {
                if (!refreshToken) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const secret =
                    process.env.REFRESH_TOKEN_SECRET || "fallback-secret"
                const decodedToken = jwt.verify(
                    refreshToken,
                    secret
                ) as JwtPayload

                const user = await User.findById(decodedToken.id)
                if (!user) {
                    throw new ApiError(401, "Invalid refresh token")
                }

                if (user.refreshToken !== refreshToken) {
                    throw new ApiError(401, "Refresh token is expired or used")
                }

                const { accessToken, refreshToken: newRefreshToken } =
                    await generateAccessTokenAndRefreshToken(user)

                return {
                    accessToken,
                    refreshToken: newRefreshToken,
                    user,
                }
            } catch (error) {
                throw error
            }
        },

        changePassword: async (
            _: ResolverParent,
            {
                oldPassword,
                newPassword,
            }: { oldPassword: string; newPassword: string },
            context: GraphQLResolverContext
        ) => {
            try {
                const userId = context.user?.id || context.req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const user = await User.findById(userId)
                if (!user) {
                    throw new ApiError(404, "User not found")
                }

                const isPasswordValid =
                    await user.isPasswordCorrect(oldPassword)
                if (!isPasswordValid) {
                    throw new ApiError(400, "Invalid old password")
                }

                user.password = newPassword
                await user.save({ validateBeforeSave: false })

                return true
            } catch (error) {
                throw error
            }
        },

        updateUserDetails: async (
            _: ResolverParent,
            { fullName }: { fullName: string },
            context: GraphQLResolverContext
        ) => {
            try {
                const userId = context.user?.id || context.req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const user = await User.findByIdAndUpdate(
                    userId,
                    { $set: { fullName } },
                    { new: true }
                ).select("-password -refreshToken")

                if (!user) {
                    throw new ApiError(404, "User not found")
                }

                return user
            } catch (error) {
                throw error
            }
        },

        updateUserAvatar: async (
            _: ResolverParent,
            { avatarUrl, publicId }: { avatarUrl: string; publicId: string },
            context: GraphQLResolverContext
        ) => {
            try {
                const userId = context.user?.id || context.req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                // Note: In a real GraphQL implementation, you would handle file uploads differently
                // This is a simplified version that takes URL and public_id directly
                const user = await User.findByIdAndUpdate(
                    userId,
                    {
                        $set: {
                            avatar: { url: avatarUrl, public_id: publicId },
                        },
                    },
                    { new: true }
                ).select("-password -refreshToken")

                if (!user) {
                    throw new ApiError(404, "User not found")
                }

                return user
            } catch (error) {
                throw error
            }
        },

        updateUserCoverImage: async (
            _: ResolverParent,
            {
                coverImageUrl,
                publicId,
            }: { coverImageUrl: string; publicId: string },
            context: GraphQLResolverContext
        ) => {
            try {
                const userId = context.user?.id || context.req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                // Note: In a real GraphQL implementation, you would handle file uploads differently
                const user = await User.findByIdAndUpdate(
                    userId,
                    {
                        $set: {
                            coverImage: {
                                url: coverImageUrl,
                                public_id: publicId,
                            },
                        },
                    },
                    { new: true }
                ).select("-password -refreshToken")

                if (!user) {
                    throw new ApiError(404, "User not found")
                }

                return user
            } catch (error) {
                throw error
            }
        },
    },
}

// Helper function for token generation
const generateAccessTokenAndRefreshToken = async (user: any) => {
    try {
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}
