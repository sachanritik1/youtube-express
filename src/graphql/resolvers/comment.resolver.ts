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

        getComment: async (
            _: ResolverParent,
            { commentId }: { commentId: string }
        ) => {
            try {
                const comment =
                    await Comment.findById(commentId).populate("owner")

                if (!comment) {
                    throw new ApiError(404, "Comment not found")
                }

                return comment
            } catch (error) {
                throw error
            }
        },

        getReplies: async (
            _: ResolverParent,
            {
                commentId,
                page = 1,
                limit = 10,
            }: { commentId: string; page?: number; limit?: number }
        ) => {
            try {
                const options: any = {
                    page: parseInt(page.toString()),
                    limit: parseInt(limit.toString()),
                    sort: { createdAt: -1 },
                    populate: "owner",
                }

                const commentModel = Comment as any
                const replies = await commentModel.paginate(
                    { parent: commentId },
                    options
                )

                return {
                    comments: replies.docs,
                    totalPages: replies.totalPages,
                    totalComments: replies.totalDocs,
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

        updateComment: async (
            _: ResolverParent,
            { commentId, content }: { commentId: string; content: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const comment = await Comment.findById(commentId)
                if (!comment) {
                    throw new ApiError(404, "Comment not found")
                }

                if (comment.owner.toString() !== userId) {
                    throw new ApiError(
                        403,
                        "You don't have permission to update this comment"
                    )
                }

                const updatedComment = await Comment.findByIdAndUpdate(
                    commentId,
                    { $set: { content } },
                    { new: true }
                ).populate("owner")

                return updatedComment
            } catch (error) {
                throw error
            }
        },

        deleteComment: async (
            _: ResolverParent,
            { commentId }: { commentId: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const comment = await Comment.findById(commentId)
                if (!comment) {
                    throw new ApiError(404, "Comment not found")
                }

                if (comment.owner.toString() !== userId) {
                    throw new ApiError(
                        403,
                        "You don't have permission to delete this comment"
                    )
                }

                await Comment.findByIdAndDelete(commentId)

                // Also delete all replies
                await Comment.deleteMany({ parent: commentId })

                return true
            } catch (error) {
                throw error
            }
        },

        replyComment: async (
            _: ResolverParent,
            { commentId, content }: { commentId: string; content: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const parentComment = await Comment.findById(commentId)
                if (!parentComment) {
                    throw new ApiError(404, "Parent comment not found")
                }

                const reply = await Comment.create({
                    content,
                    video: parentComment.video,
                    owner: userId,
                    parent: commentId,
                })

                const populatedReply = await Comment.findById(
                    reply._id
                ).populate("owner")

                return populatedReply
            } catch (error) {
                throw error
            }
        },
    },
}
