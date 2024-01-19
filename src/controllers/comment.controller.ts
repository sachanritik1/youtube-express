import asyncHandler from "../utils/asyncHandler"
import { Comment } from "../models/comment.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { Request, Response } from "express"
import { MyRequest } from "../middlewares/auth.middleware"

export const getVideoComments = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { videoId } = req.params
            const comments = await Comment.find({
                video: videoId,
                isReply: false,
            })
            return res
                .status(200)
                .send(new ApiResponse(200, "success", comments))
        } catch (err) {
            throw new ApiError(404, "Comments not found")
        }
    }
)

export const createComment = asyncHandler(
    async (req: MyRequest, res: Response) => {
        try {
            const { videoId } = req.params
            const { content } = req.body
            const userId = req.user.id
            const comment = await Comment.create({
                content,
                owner: userId,
                video: videoId,
            })
            res.status(200).send(new ApiResponse(200, "comment created", {}))
        } catch (err) {
            throw new ApiError(500, "Comment not created")
        }
    }
)

export const deleteComment = asyncHandler(
    async (req: MyRequest, res: Response) => {
        try {
            const { commentId } = req.params
            const userId = req.user.id
            await Comment.findOneAndDelete({ id: commentId, owner: userId })
            res.status(200).send(new ApiResponse(200, "success", {}))
        } catch (err) {
            throw new ApiError(404, "Comment not found")
        }
    }
)

export const updateComment = asyncHandler(
    async (req: MyRequest, res: Response) => {
        try {
            const { commentId } = req.params
            const { content } = req.body
            const userId = req.user.id
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
    async (req: MyRequest, res: Response) => {
        try {
            const { commentId } = req.params
            const { content } = req.body
            const userId = req.user.id
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
