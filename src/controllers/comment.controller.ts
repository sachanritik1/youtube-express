import asyncHandler from "../utils/asyncHandler"
import { Comment } from "../models/comment.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { Request, Response } from "express"
import mongoose from "mongoose"

export const getVideoComments = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { videoId } = req.params

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

            return res
                .status(200)
                .send(new ApiResponse(200, "success", comments))
        } catch (err) {
            throw new ApiError(404, "Comments not found")
        }
    }
)

export const createComment = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { videoId } = req.params
            const { content, parent = null } = req.body

            const userId = req.headers["userId"]
            const comment = await Comment.create({
                content,
                owner: userId,
                video: videoId,
                parent,
            })

            const result = await Comment.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(comment._id),
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

            res.status(200).send(
                new ApiResponse(200, "comment created", result[0])
            )
        } catch (err) {
            console.log(err)
            throw new ApiError(500, "Comment not created")
        }
    }
)

export const deleteComment = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { commentId } = req.params
            const userId = req.headers["userId"]
            await Comment.findOneAndDelete({ id: commentId, owner: userId })
            res.status(200).send(new ApiResponse(200, "success", {}))
        } catch (err) {
            throw new ApiError(404, "Comment not found")
        }
    }
)

export const updateComment = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { commentId } = req.params
            const { content } = req.body
            const userId = req.headers["userId"]
            const comment = await Comment.findOne({
                id: commentId,
                owner: userId,
            })
            comment.content = content
            await comment.save()
            res.status(200).send(new ApiResponse(200, "success", comment))
        } catch (err) {
            throw new ApiError(400, "Comment not found")
        }
    }
)

export const replyComment = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { commentId } = req.params
            const { content } = req.body
            const userId = req.headers["userId"]
            const comment = await Comment.findById(commentId)
            const reply = await Comment.create({
                content,
                owner: userId,
                video: comment.video,
                isReply: true,
            })
            comment.replies.push(reply.id)
            await comment.save()
            res.status(200).send(new ApiResponse(200, "success", {}))
        } catch (err) {
            throw new ApiError(400, "Comment not found")
        }
    }
)

export const getComment = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const comment = await Comment.findById(commentId)
        res.status(200).send(new ApiResponse(200, "success", comment))
    } catch (err) {
        throw new ApiError(404, "Comment not found")
    }
})

export const getComments = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params(commentId)

    try {
        const comments = await Comment.aggregate([
            {
                $match: {
                    parent: new mongoose.Types.ObjectId(commentId),
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
        res.status(200).send(new ApiResponse(200, "success", comments))
    } catch (err) {
        throw new ApiError(404, "Comments not found")
    }
})
