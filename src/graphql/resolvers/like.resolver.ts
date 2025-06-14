import { Like } from "../../models/like.model"
import { ApiError } from "../../utils/ApiError"
import {
    GraphQLResolverContext,
    LikeFilterQuery,
    ResolverParent,
} from "../types"

export const likeResolvers = {
    Query: {
        getLikes: async (
            _: ResolverParent,
            { type, id }: { type: string; id: string }
        ) => {
            try {
                const filter: Record<string, any> = {}

                switch (type) {
                    case "VIDEO":
                        filter["video"] = id
                        break
                    case "COMMENT":
                        filter["comment"] = id
                        break
                    case "TWEET":
                        filter["tweet"] = id
                        break
                    default:
                        throw new ApiError(400, "Invalid like type")
                }

                const likes = await Like.find(filter).populate("likedBy")
                return likes
            } catch (error) {
                throw error
            }
        },
    },

    Mutation: {
        toggleLike: async (
            _: ResolverParent,
            { type, id }: { type: string; id: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const filter: LikeFilterQuery = {
                    likedBy: userId,
                }

                switch (type) {
                    case "VIDEO":
                        filter["video"] = id
                        break
                    case "COMMENT":
                        filter["comment"] = id
                        break
                    case "TWEET":
                        filter["tweet"] = id
                        break
                    default:
                        throw new ApiError(400, "Invalid like type")
                }

                // Check if like already exists
                const existingLike = await Like.findOne(filter as any)

                if (existingLike) {
                    // Unlike: Remove the like
                    await Like.findByIdAndDelete(existingLike._id)
                    return true
                } else {
                    // Like: Create a new like
                    await Like.create(filter)
                    return true
                }
            } catch (error) {
                throw error
            }
        },
    },
}
