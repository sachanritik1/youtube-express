import asyncHandler from "../utils/asyncHandler.js"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

export const getVideoComments = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        const comments = await Comment.find({ video: videoId, isReply: false })
        return res.status(200).send(new ApiResponse(200, "success", comments))
    } catch (err) {
        throw new ApiError(404, "Comments not found")
    }
})

export const createComment = asyncHandler(async (req, res) => {
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
})

export const deleteComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params
        const userId = req.user.id
        await Comment.findOneAndDelete({ _id: commentId, owner: userId })
        res.status(200).send(new ApiResponse(200, "success", {}))
    } catch (err) {
        throw new ApiError(404, "Comment not found")
    }
})

export const updateComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params
        const { content } = req.body
        const userId = req.user.id
        const comment = await Comment.findOne({ _id: commentId, owner: userId })
        comment.content = content
        await comment.save({ new: true })
        res.status(200).send(new ApiResponse(200, "success", comment))
    } catch (err) {
        throw new ApiError(400, "Comment not found")
    }
})

export const replyComment = asyncHandler(async (req, res) => {
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
        comment.replies.push(reply._id)
        await comment.save({ new: true })
        res.status(200).send(new ApiResponse(200, "success", {}))
    } catch (err) {
        throw new ApiError(400, "Comment not found")
    }
})
