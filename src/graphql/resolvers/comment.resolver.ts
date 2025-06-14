import { Comment } from "../../models/comment.model"
import { ApiError } from "../../utils/ApiError"
import { GraphQLResolverContext, ResolverParent } from "../types"
import mongoose from "mongoose"

export const commentResolvers = {
    Query: {
        getVideoComments: async (
            _: ResolverParent,
            {
                videoId,
                page = 1,
                limit = 10,
            }: { videoId: string; page?: number; limit?: number }
        ) => {
            try {
                const options: any = {
                    page: parseInt(page.toString()),
                    limit: parseInt(limit.toString()),
                    sort: { createdAt: -1 },
                    populate: "owner",
                }

                // Type assertion for paginate function
                const comments = await Comment.aggregate([
                    {
                        $match: {
                            video: new mongoose.Types.ObjectId(videoId),
                            parent: null,
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        email: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },

                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "parent",
                            as: "replies",
                        },
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$owner", 0] },
                            replies: { $size: "$replies" },
                        },
                    },
                ])

                return {
                    comments: comments,
                    totalPages: 10,
                    totalComments: 10,
                }
            } catch (error) {
                throw error
            }
        },
    },

    Mutation: {
        addComment: async (
            _: ResolverParent,
            { videoId, content }: { videoId: string; content: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const comment = await Comment.create({
                    content,
                    video: videoId,
                    owner: userId,
                })

                const populatedComment = await Comment.findById(
                    comment._id
                ).populate("owner")

                return populatedComment
            } catch (error) {
                throw error
            }
        },
    },
}
